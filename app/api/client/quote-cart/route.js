import { NextResponse } from "next/server";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";

// function formatRFQNumber(id) {
//   const today = new Date();
//   const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
//   return `RFQIndihand${dateStr}-${String(id).padStart(4, "0")}`;
// }


async function formatRFQNumber(companyId) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  /* 1️⃣ get company short */
  const [[company]] = await db.query(
    `SELECT short_name FROM companies WHERE id = ?`,
    [companyId]
  );

  if (!company) throw new Error("Company not found");

  const short = company.short_name;

  /* 2️⃣ count today's RFQ for company */
  const [[row]] = await db.query(
    `
    SELECT COUNT(*) AS count
    FROM rfqs
    WHERE company_id = ?
      AND DATE(created_at) = CURDATE()
    `,
    [companyId]
  );

  const seq = row.count + 1;

  return `RFQ-${short}-${dateStr}-${seq}`;
}


export async function GET(req) {
  try {
    /* ===== AUTH ===== */
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { companyId, branchId } = decoded;

    /* 1️⃣ FIND DRAFT RFQ (company + branch) */
    const [[rfq]] = await db.query(
      `
      SELECT id ,rfq_number
      FROM rfqs
      WHERE company_id = ?
        AND branch_id = ?
        AND status = 'Draft'
      LIMIT 1
      `,
      [companyId, branchId]
    );

    if (!rfq) {
      return NextResponse.json({
          rfq_number: null,
        items: [],
        summary: { totalItems: 0, subtotal: 0 },
      });
    }

    /* 2️⃣ FETCH CART ITEMS */
    const [items] = await db.query(
      `
      SELECT
        p.id AS productId,
        p.product_name AS name,
        p.featured_image,
          p.stock_qty,
        rp.quantity AS qty,
        rp.quoted_price AS price
      FROM rfq_products rp
      JOIN products p ON p.id = rp.product_id
      WHERE rp.rfq_id = ?
      `,
      [rfq.id]
    );

    const subtotal = items.reduce(
      (sum, i) => sum + i.price * i.qty,
      0
    );

    return NextResponse.json({
      items,
      rfq_number: rfq.rfq_number, 
      summary: {
        totalItems: items.reduce((s, i) => s + i.qty, 0),
        subtotal,
      },
    });

  } catch (error) {
    console.error("Quote Cart GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quote cart" },
      { status: 500 }
    );
  }
}



export async function POST(req) {
  try {
    /* ===== AUTH ===== */
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, branchId } = decoded;
    const { productId, quantity } = await req.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    /* 1️⃣ FIND EXISTING DRAFT RFQ */
    let [[rfq]] = await db.query(
      `
      SELECT id, rfq_number
      FROM rfqs
      WHERE company_id = ?
        AND branch_id = ?
        AND status = 'Draft'
      LIMIT 1
      `,
      [companyId, branchId]
    );

    /* 2️⃣ CREATE DRAFT RFQ IF NOT EXISTS */
    if (!rfq) {
      const [result] = await db.query(
        `
        INSERT INTO rfqs (company_id, branch_id, status)
        VALUES (?, ?, 'Draft')
        `,
        [companyId, branchId]
      );

      const rfqId = result.insertId;
      const rfqNumber =await formatRFQNumber(companyId);

      // 🔥 STORE FORMATTED RFQ NUMBER IN DB
      await db.query(
        `
        UPDATE rfqs
        SET rfq_number = ?
        WHERE id = ?
        `,
        [rfqNumber, rfqId]
      );

      rfq = { id: rfqId, rfq_number: rfqNumber };
    }

 /* 3️⃣ GET PRODUCT PRICE (CUSTOM → BASE FALLBACK) */
const [[product]] = await db.query(
  `
  SELECT
    COALESCE(cp.custom_price, p.base_price) AS price
  FROM products p
  LEFT JOIN company_product_pricing cp
    ON cp.product_id = p.id
   AND cp.company_id = ?
  WHERE p.id = ?
  `,
  [companyId, productId]
);

if (!product) {
  return NextResponse.json(
    { error: "Product not found" },
    { status: 404 }
  );
}


    /* 4️⃣ CHECK IF PRODUCT EXISTS IN RFQ */
    const [[existing]] = await db.query(
      `
      SELECT quantity
      FROM rfq_products
      WHERE rfq_id = ?
        AND product_id = ?
      `,
      [rfq.id, productId]
    );

    if (existing) {
      await db.query(
        `
        UPDATE rfq_products
        SET quantity = quantity + ?
        WHERE rfq_id = ? AND product_id = ?
        `,
        [quantity, rfq.id, productId]
      );
    } else {
      await db.query(
        `
        INSERT INTO rfq_products
        (rfq_id, product_id, quantity, quoted_price)
        VALUES (?, ?, ?, ?)
        `,
        [rfq.id, productId, quantity, product.price]
      );
    }

    /* ✅ RESPONSE */
    return NextResponse.json({
      success: true,
      rfq_id: rfq.id,
      rfq_number: rfq.rfq_number, // ✅ comes from DB now
    });

  } catch (error) {
    console.error("Add to Quote Error:", error);
    return NextResponse.json(
      { error: "Failed to add to quote" },
      { status: 500 }
    );
  }
}



export async function PATCH(req) {
  try {
    /* ================= AUTH ================= */
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { companyId, branchId } = decoded;
    const { productId, action } = await req.json();

    if (!productId || !["inc", "dec"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    /* ================= FIND DRAFT RFQ ================= */
    const [[rfq]] = await db.query(
      `
      SELECT id
      FROM rfqs
      WHERE company_id = ?
        AND branch_id = ?
        AND status = 'Draft'
      LIMIT 1
      `,
      [companyId, branchId]
    );

    if (!rfq) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 404 }
      );
    }

    /* ================= GET PRODUCT STOCK ================= */
    const [[product]] = await db.query(
      `
      SELECT stock_qty
      FROM products
      WHERE id = ?
      `,
      [productId]
    );

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    /* ================= GET CART ITEM ================= */
    const [[cartItem]] = await db.query(
      `
      SELECT quantity
      FROM rfq_products
      WHERE rfq_id = ? AND product_id = ?
      `,
      [rfq.id, productId]
    );

    if (!cartItem) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }

    /* ================= INCREMENT ================= */
    if (action === "inc") {
      if (cartItem.quantity >= product.stock_qty) {
        return NextResponse.json(
          { error: "Stock limit reached" },
          { status: 400 }
        );
      }

      await db.query(
        `
        UPDATE rfq_products
        SET quantity = quantity + 1
        WHERE rfq_id = ? AND product_id = ?
        `,
        [rfq.id, productId]
      );
    }

    /* ================= DECREMENT ================= */
    if (action === "dec") {
      if (cartItem.quantity <= 1) {
        return NextResponse.json(
          { error: "Minimum quantity is 1" },
          { status: 400 }
        );
      }

      await db.query(
        `
        UPDATE rfq_products
        SET quantity = quantity - 1
        WHERE rfq_id = ? AND product_id = ?
        `,
        [rfq.id, productId]
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Update Qty Error:", error);
    return NextResponse.json(
      { error: "Failed to update quantity" },
      { status: 500 }
    );
  }
}




