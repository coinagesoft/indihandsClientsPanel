import { NextResponse } from "next/server";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";

// function formatRFQNumber(id) {
//   const today = new Date();
//   const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
//   return `RFQIndihand${dateStr}-${String(id).padStart(4, "0")}`;
// }


// async function formatRFQNumber(companyId) {
//   const today = new Date();
//   const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

//   /* 1️⃣ get company short */
//   const [[company]] = await db.query(
//     `SELECT short_name FROM companies WHERE id = ?`,
//     [companyId]
//   );

//   if (!company) throw new Error("Company not found");

//   const short = company.short_name;

//   /* 2️⃣ count today's RFQ for company */
//   const [[row]] = await db.query(
//     `
//     SELECT COUNT(*) AS count
//     FROM rfqs
//     WHERE company_id = ?
//       AND DATE(created_at) = CURDATE()
//     `,
//     [companyId]
//   );

//   const seq = row.count + 1;

//   return `RFQ-${short}-${dateStr}-${seq}`;
// }

async function formatRFQNumber(
  companyId,
  userType = "B2B"
) {

  const today = new Date();

  const dateStr = today
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  /* =====================================================
     B2C RFQ NUMBER
  ===================================================== */

  if (userType === "B2C") {

    const [[row]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM rfqs
      WHERE rfq_type = 'B2C'
        AND DATE(created_at) = CURDATE()
      `
    );

    const seq = row.count + 1;

    return `RFQ-CUS-${dateStr}-${seq}`;
  }

  /* =====================================================
     B2B RFQ NUMBER
  ===================================================== */

  /* 1️⃣ GET COMPANY SHORT NAME */
  const [[company]] = await db.query(
    `
    SELECT short_name
    FROM companies
    WHERE id = ?
    `,
    [companyId]
  );

  if (!company) {
    throw new Error("Company not found");
  }

  const short = company.short_name;

  /* 2️⃣ COUNT TODAY RFQ */
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




// export async function GET(req) {
//   try {
//     /* ===== AUTH ===== */
//     let decoded;
//     try {
//       decoded = verifyToken(req);
//     } catch (err) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { companyId, branchId } = decoded;

//     /* 1️⃣ FIND DRAFT RFQ (company + branch) */
//     const [[rfq]] = await db.query(
//       `
//       SELECT id ,rfq_number
//       FROM rfqs
//       WHERE company_id = ?
//         AND branch_id = ?
//         AND status = 'Draft'
//       LIMIT 1
//       `,
//       [companyId, branchId]
//     );

//     if (!rfq) {
//       return NextResponse.json({
//           rfq_number: null,
//         items: [],
//         summary: { totalItems: 0, subtotal: 0 },
//       });
//     }

//     /* 2️⃣ FETCH CART ITEMS */
//     const [items] = await db.query(
//       `
//       SELECT
//         p.id AS productId,
//         CASE 
//   WHEN cpp.prefix IS NOT NULL AND cpp.prefix != ''
//   THEN CONCAT(cpp.prefix, ' | ', p.product_name)
//   ELSE p.product_name
// END AS name,
//         p.featured_image,
//           p.stock_qty,
//         rp.quantity AS qty,
//         rp.quoted_price AS price
//       FROM rfq_products rp
//       JOIN products p ON p.id = rp.product_id

//   LEFT JOIN company_product_pricing cpp  
// ON cpp.product_id = p.id
//  AND cpp.company_id = ? 

//       WHERE rp.rfq_id = ?
//       `,
//       [companyId, rfq.id]
//     );

//     const subtotal = items.reduce(
//       (sum, i) => sum + i.price * i.qty,
//       0
//     );

//     return NextResponse.json({
//       items,
//       rfq_number: rfq.rfq_number, 
//       summary: {
//         totalItems: items.reduce((s, i) => s + i.qty, 0),
//         subtotal,
//       },
//     });

//   } catch (error) {
//     console.error("Quote Cart GET Error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch quote cart" },
//       { status: 500 }
//     );
//   }
// }



// export async function POST(req) {
//   try {
//     /* ===== AUTH ===== */
//     let decoded;
//     try {
//       decoded = verifyToken(req);
//     } catch {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//   const {
//   companyId,
//   branchId,
//   customerId,
//   userType,
// } = decoded;
//     const { productId, quantity } = await req.json();

//     if (!productId || !quantity || quantity < 1) {
//       return NextResponse.json(
//         { error: "Invalid payload" },
//         { status: 400 }
//       );
//     }

//     /* 1️⃣ FIND EXISTING DRAFT RFQ */
//     let [[rfq]] = await db.query(
//       `
//       SELECT id, rfq_number
//       FROM rfqs
//       WHERE company_id = ?
//         AND branch_id = ?
//         AND status = 'Draft'
//       LIMIT 1
//       `,
//       [companyId, branchId]
//     );

//     /* 2️⃣ CREATE DRAFT RFQ IF NOT EXISTS */
//     if (!rfq) {
//       const [result] = await db.query(
//         `
//         INSERT INTO rfqs (company_id, branch_id, status)
//         VALUES (?, ?, 'Draft')
//         `,
//         [companyId, branchId]
//       );

//       const rfqId = result.insertId;
//       const rfqNumber =await formatRFQNumber(companyId);

//       // 🔥 STORE FORMATTED RFQ NUMBER IN DB
//       await db.query(
//         `
//         UPDATE rfqs
//         SET rfq_number = ?
//         WHERE id = ?
//         `,
//         [rfqNumber, rfqId]
//       );

//       rfq = { id: rfqId, rfq_number: rfqNumber };
//     }

//  /* 3️⃣ GET PRODUCT PRICE (CUSTOM → BASE FALLBACK) */
// const [[product]] = await db.query(
//   `
//   SELECT
//     COALESCE(cp.custom_price, p.base_price) AS price
//   FROM products p
//   LEFT JOIN company_product_pricing cp
//     ON cp.product_id = p.id
//    AND cp.company_id = ?
//   WHERE p.id = ?
//   `,
//   [companyId, productId]
// );

// if (!product) {
//   return NextResponse.json(
//     { error: "Product not found" },
//     { status: 404 }
//   );
// }


//     /* 4️⃣ CHECK IF PRODUCT EXISTS IN RFQ */
//     const [[existing]] = await db.query(
//       `
//       SELECT quantity
//       FROM rfq_products
//       WHERE rfq_id = ?
//         AND product_id = ?
//       `,
//       [rfq.id, productId]
//     );

//     if (existing) {
//       await db.query(
//         `
//         UPDATE rfq_products
//         SET quantity = quantity + ?
//         WHERE rfq_id = ? AND product_id = ?
//         `,
//         [quantity, rfq.id, productId]
//       );
//     } else {
//       await db.query(
//         `
//         INSERT INTO rfq_products
//         (rfq_id, product_id, quantity, quoted_price)
//         VALUES (?, ?, ?, ?)
//         `,
//         [rfq.id, productId, quantity, product.price]
//       );
//     }

//     /* ✅ RESPONSE */
//     return NextResponse.json({
//       success: true,
//       rfq_id: rfq.id,
//       rfq_number: rfq.rfq_number, // ✅ comes from DB now
//     });

//   } catch (error) {
//     console.error("Add to Quote Error:", error);
//     return NextResponse.json(
//       { error: "Failed to add to quote" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(req) {
  try {

    /* =====================================================
       AUTH
    ===================================================== */

    let decoded;

    try {
      decoded = verifyToken(req);
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      companyId,
      branchId,
      customerId,
      userType,
    } = decoded;

    /* =====================================================
       FIND DRAFT RFQ
    ===================================================== */

    let rfqQuery = "";
    let rfqParams = [];

    if (userType === "B2B") {

      rfqQuery = `
        SELECT id, rfq_number
        FROM rfqs
        WHERE company_id = ?
          AND branch_id = ?
          AND status = 'Draft'
        LIMIT 1
      `;

      rfqParams = [
        companyId,
        branchId,
      ];

    } else {

      rfqQuery = `
        SELECT id, rfq_number
        FROM rfqs
        WHERE customer_id = ?
          AND status = 'Draft'
        LIMIT 1
      `;

      rfqParams = [customerId];
    }

    const [[rfq]] = await db.query(
      rfqQuery,
      rfqParams
    );

    /* =====================================================
       EMPTY CART
    ===================================================== */

    if (!rfq) {
      return NextResponse.json({
        rfq_number: null,
        items: [],
        summary: {
          totalItems: 0,
          subtotal: 0,
        },
      });
    }

    /* =====================================================
       FETCH CART ITEMS
    ===================================================== */

    let itemsQuery = "";
    let itemsParams = [];

    if (userType === "B2B") {

      itemsQuery = `
        SELECT

          p.id AS productId,

          CASE
            WHEN cpp.prefix IS NOT NULL
             AND cpp.prefix != ''
            THEN CONCAT(
              cpp.prefix,
              ' | ',
              p.product_name
            )
            ELSE p.product_name
          END AS name,

          p.featured_image,
          p.stock_qty,

          rp.quantity AS qty,
          rp.quoted_price AS price

        FROM rfq_products rp

        JOIN products p
          ON p.id = rp.product_id

        LEFT JOIN company_product_pricing cpp
          ON cpp.product_id = p.id
         AND cpp.company_id = ?

        WHERE rp.rfq_id = ?
      `;

      itemsParams = [
        companyId,
        rfq.id,
      ];

    } else {

      itemsQuery = `
        SELECT

          p.id AS productId,

          p.product_name AS name,

          p.featured_image,
          p.stock_qty,

          rp.quantity AS qty,
          rp.quoted_price AS price

        FROM rfq_products rp

        JOIN products p
          ON p.id = rp.product_id

        WHERE rp.rfq_id = ?
      `;

      itemsParams = [rfq.id];
    }

    const [items] = await db.query(
      itemsQuery,
      itemsParams
    );

    /* =====================================================
       TOTALS
    ===================================================== */

    const subtotal = items.reduce(
      (sum, i) =>
        sum + i.price * i.qty,
      0
    );

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      items,

      rfq_number: rfq.rfq_number,

      summary: {
        totalItems: items.reduce(
          (s, i) => s + i.qty,
          0
        ),

        subtotal,
      },
    });

  } catch (error) {

    console.error(
      "Quote Cart GET Error:",
      error
    );

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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      companyId,
      branchId,
      customerId,
      userType,
    } = decoded;

    const {
      productId,
      quantity,
    } = await req.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    /* =====================================================
       FIND EXISTING DRAFT RFQ
    ===================================================== */

    let rfqQuery = "";
    let rfqParams = [];

    if (userType === "B2B") {

      rfqQuery = `
        SELECT id, rfq_number
        FROM rfqs
        WHERE company_id = ?
          AND branch_id = ?
          AND status = 'Draft'
        LIMIT 1
      `;

      rfqParams = [companyId, branchId];

    } else {

      rfqQuery = `
        SELECT id, rfq_number
        FROM rfqs
        WHERE customer_id = ?
          AND status = 'Draft'
        LIMIT 1
      `;

      rfqParams = [customerId];
    }

    let [[rfq]] = await db.query(
      rfqQuery,
      rfqParams
    );

    /* =====================================================
       CREATE DRAFT RFQ
    ===================================================== */

    if (!rfq) {

      let result;

      if (userType === "B2B") {

        [result] = await db.query(
          `
          INSERT INTO rfqs
          (
            company_id,
            branch_id,
            status,
            rfq_type
          )
          VALUES (?, ?, 'Draft', 'B2B')
          `,
          [companyId, branchId]
        );

      } else {

        [result] = await db.query(
          `
          INSERT INTO rfqs
          (
            customer_id,
            status,
            rfq_type,
            billing_type
          )
          VALUES (?, 'Draft', 'B2C', 'Self')
          `,
          [customerId]
        );
      }

      const rfqId = result.insertId;

      const rfqNumber = await formatRFQNumber(
        companyId,
        userType
      );

      /* ===== STORE RFQ NUMBER ===== */

      await db.query(
        `
        UPDATE rfqs
        SET rfq_number = ?
        WHERE id = ?
        `,
        [rfqNumber, rfqId]
      );

      rfq = {
        id: rfqId,
        rfq_number: rfqNumber,
      };
    }

    /* =====================================================
       GET PRODUCT PRICE
    ===================================================== */

    let productQuery = "";
    let productParams = [];

    if (userType === "B2B") {

      productQuery = `
        SELECT
          COALESCE(
            cp.custom_price,
            p.base_price
          ) AS price

        FROM products p

        LEFT JOIN company_product_pricing cp
          ON cp.product_id = p.id
         AND cp.company_id = ?

        WHERE p.id = ?
      `;

      productParams = [
        companyId,
        productId,
      ];

    } else {

      productQuery = `
        SELECT
          p.base_price AS price
        FROM products p
        WHERE p.id = ?
      `;

      productParams = [productId];
    }

    const [[product]] = await db.query(
      productQuery,
      productParams
    );

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    /* =====================================================
       CHECK EXISTING PRODUCT
    ===================================================== */

    const [[existing]] = await db.query(
      `
      SELECT quantity
      FROM rfq_products
      WHERE rfq_id = ?
        AND product_id = ?
      `,
      [rfq.id, productId]
    );

    /* =====================================================
       UPDATE / INSERT
    ===================================================== */

    if (existing) {

      await db.query(
        `
        UPDATE rfq_products
        SET quantity = quantity + ?
        WHERE rfq_id = ?
          AND product_id = ?
        `,
        [
          quantity,
          rfq.id,
          productId,
        ]
      );

    } else {

      await db.query(
        `
        INSERT INTO rfq_products
        (
          rfq_id,
          product_id,
          quantity,
          quoted_price
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          rfq.id,
          productId,
          quantity,
          product.price,
        ]
      );
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,
      rfq_id: rfq.id,
      rfq_number: rfq.rfq_number,
    });

  } catch (error) {

    console.error(
      "Add to Quote Error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to add to quote" },
      { status: 500 }
    );
  }
}


// export async function PATCH(req) {
//   try {
//     /* ================= AUTH ================= */
//     let decoded;
//     try {
//       decoded = verifyToken(req);
//     } catch {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const { companyId, branchId } = decoded;
//     const { productId, action } = await req.json();

//     if (!productId || !["inc", "dec"].includes(action)) {
//       return NextResponse.json(
//         { error: "Invalid payload" },
//         { status: 400 }
//       );
//     }

//     /* ================= FIND DRAFT RFQ ================= */
//     const [[rfq]] = await db.query(
//       `
//       SELECT id
//       FROM rfqs
//       WHERE company_id = ?
//         AND branch_id = ?
//         AND status = 'Draft'
//       LIMIT 1
//       `,
//       [companyId, branchId]
//     );

//     if (!rfq) {
//       return NextResponse.json(
//         { error: "Cart is empty" },
//         { status: 404 }
//       );
//     }

//     /* ================= GET PRODUCT STOCK ================= */
//     const [[product]] = await db.query(
//       `
//       SELECT stock_qty
//       FROM products
//       WHERE id = ?
//       `,
//       [productId]
//     );

//     if (!product) {
//       return NextResponse.json(
//         { error: "Product not found" },
//         { status: 404 }
//       );
//     }

//     /* ================= GET CART ITEM ================= */
//     const [[cartItem]] = await db.query(
//       `
//       SELECT quantity
//       FROM rfq_products
//       WHERE rfq_id = ? AND product_id = ?
//       `,
//       [rfq.id, productId]
//     );

//     if (!cartItem) {
//       return NextResponse.json(
//         { error: "Item not found in cart" },
//         { status: 404 }
//       );
//     }

//     /* ================= INCREMENT ================= */
//     if (action === "inc") {
//       if (cartItem.quantity >= product.stock_qty) {
//         return NextResponse.json(
//           { error: "Stock limit reached" },
//           { status: 400 }
//         );
//       }

//       await db.query(
//         `
//         UPDATE rfq_products
//         SET quantity = quantity + 1
//         WHERE rfq_id = ? AND product_id = ?
//         `,
//         [rfq.id, productId]
//       );
//     }

//     /* ================= DECREMENT ================= */
//     if (action === "dec") {
//       if (cartItem.quantity <= 1) {
//         return NextResponse.json(
//           { error: "Minimum quantity is 1" },
//           { status: 400 }
//         );
//       }

//       await db.query(
//         `
//         UPDATE rfq_products
//         SET quantity = quantity - 1
//         WHERE rfq_id = ? AND product_id = ?
//         `,
//         [rfq.id, productId]
//       );
//     }

//     return NextResponse.json({ success: true });

//   } catch (error) {
//     console.error("Update Qty Error:", error);
//     return NextResponse.json(
//       { error: "Failed to update quantity" },
//       { status: 500 }
//     );
//   }
// }


export async function PATCH(req) {
  try {

    /* =====================================================
       AUTH
    ===================================================== */

    let decoded;

    try {
      decoded = verifyToken(req);
    } catch {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      companyId,
      branchId,
      customerId,
      userType,
    } = decoded;

    const {
      productId,
      action,
    } = await req.json();

    if (
      !productId ||
      !["inc", "dec"].includes(action)
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    /* =====================================================
       FIND DRAFT RFQ
    ===================================================== */

    let rfqQuery = "";
    let rfqParams = [];

    if (userType === "B2B") {

      rfqQuery = `
        SELECT id
        FROM rfqs
        WHERE company_id = ?
          AND branch_id = ?
          AND status = 'Draft'
        LIMIT 1
      `;

      rfqParams = [
        companyId,
        branchId,
      ];

    } else {

      rfqQuery = `
        SELECT id
        FROM rfqs
        WHERE customer_id = ?
          AND status = 'Draft'
        LIMIT 1
      `;

      rfqParams = [customerId];
    }

    const [[rfq]] = await db.query(
      rfqQuery,
      rfqParams
    );

    if (!rfq) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 404 }
      );
    }

    /* =====================================================
       GET PRODUCT STOCK
    ===================================================== */

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

    /* =====================================================
       GET CART ITEM
    ===================================================== */

    const [[cartItem]] = await db.query(
      `
      SELECT quantity
      FROM rfq_products
      WHERE rfq_id = ?
        AND product_id = ?
      `,
      [rfq.id, productId]
    );

    if (!cartItem) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }

    /* =====================================================
       INCREMENT
    ===================================================== */

    if (action === "inc") {

      if (
        cartItem.quantity >=
        product.stock_qty
      ) {
        return NextResponse.json(
          { error: "Stock limit reached" },
          { status: 400 }
        );
      }

      await db.query(
        `
        UPDATE rfq_products
        SET quantity = quantity + 1
        WHERE rfq_id = ?
          AND product_id = ?
        `,
        [rfq.id, productId]
      );
    }

    /* =====================================================
       DECREMENT
    ===================================================== */

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
        WHERE rfq_id = ?
          AND product_id = ?
        `,
        [rfq.id, productId]
      );
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.error(
      "Update Qty Error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update quantity" },
      { status: 500 }
    );
  }
}



