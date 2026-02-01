import { NextResponse } from "next/server";
import { db } from "../../../db";

export async function GET() {
  try {
    const companyId = 1; // TODO: from auth
    const branchId = 1;  // TODO: from auth

    /* 1️⃣ FIND DRAFT RFQ (company + branch) */
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
      return NextResponse.json({
        items: [],
        summary: { totalItems: 0, subtotal: 0 }
      });
    }

    /* 2️⃣ FETCH CART ITEMS */
    const [items] = await db.query(
      `
      SELECT
        p.id AS productId,
        p.product_name AS name,
        p.featured_image,
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
      summary: {
        totalItems: items.reduce((s, i) => s + i.qty, 0),
        subtotal
      }
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
    // TODO: replace with auth later
    const companyId = 1;
    const branchId = 1;

    const { productId, quantity } = await req.json();

    console.log("🟢 Quote Cart Payload:", { productId, quantity });

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid payload", received: { productId, quantity } },
        { status: 400 }
      );
    }

    /* 1️⃣ FIND OR CREATE DRAFT RFQ (company + branch scoped) */
    let [[rfq]] = await db.query(
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
      const [result] = await db.query(
        `
        INSERT INTO rfqs (company_id, branch_id, status)
        VALUES (?, ?, 'Draft')
        `,
        [companyId, branchId]
      );

      rfq = { id: result.insertId };
    }

    /* 2️⃣ GET PRODUCT PRICE */
    const [[product]] = await db.query(
      `
      SELECT base_price
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

    /* 3️⃣ CHECK IF PRODUCT EXISTS IN RFQ */
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
        [rfq.id, productId, quantity, product.base_price]
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Add to Quote Error FULL:", {
      message: error.message,
      sqlMessage: error.sqlMessage,
      stack: error.stack,
    });

    return NextResponse.json(
      { error: error.message || "Failed to add to quote" },
      { status: 500 }
    );
  }
}



export async function PATCH(req) {
  try {
    const companyId = 1; // TODO: from auth
    const branchId = 1;  // TODO: from auth

    const { productId, action } = await req.json();

    if (!productId || !["inc", "dec"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

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
        { error: "Cart empty" },
        { status: 404 }
      );
    }

    if (action === "inc") {
      await db.query(
        `
        UPDATE rfq_products
        SET quantity = quantity + 1
        WHERE rfq_id = ? AND product_id = ?
        `,
        [rfq.id, productId]
      );
    }

    if (action === "dec") {
      await db.query(
        `
        UPDATE rfq_products
        SET quantity = quantity - 1
        WHERE rfq_id = ? AND product_id = ?
          AND quantity > 1
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

