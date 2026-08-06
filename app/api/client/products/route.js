import { NextResponse } from "next/server";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);

//     const search = searchParams.get("search");
//     const stock = searchParams.get("stock");
//     const sort = searchParams.get("sort") || "latest";
//     const catalogId = searchParams.get("catalogId");

//  /* ===== AUTH ===== */
//        let decoded;
//        try {
//          decoded = verifyToken(req);
//        } catch (err) {
//          console.error("Auth error:", err.message);
//          return NextResponse.json(
//            { error: "Unauthorized" },
//            { status: 401 }
//          );
//        }
   
//        const { companyId} = decoded; 

//     if (!catalogId) {
//       return NextResponse.json([], { status: 200 });
//     }

//    const [catalogRows] = await db.query(
//   `SELECT name FROM catalogs WHERE id = ? LIMIT 1`,
//   [catalogId]
// );

// const catalog = catalogRows?.[0] || null;

//     let where = `WHERE pcm.catalog_id = ?`;
//     const values = [catalogId];
  

// if (search) {
//   where += `
//     AND (
//       p.product_name LIKE ?
//       OR p.barcode LIKE ?
//     )
//   `;
//   values.push(`%${search}%`, `%${search}%`);
// }


//     if (stock === "in") where += ` AND p.stock_qty > 0`;
//     if (stock === "out") where += ` AND p.stock_qty = 0`;

//     /* ================= SORT ================= */
//   let orderBy = `ORDER BY p.created_at DESC`;

// if (sort === "price_asc") {
//   orderBy = `
//     ORDER BY CAST(
//       SUBSTRING_INDEX(COALESCE(cpp.custom_price, p.base_price), '-', 1)
//     AS DECIMAL(10,2)) ASC
//   `;
// }

// if (sort === "price_desc") {
//   orderBy = `
//     ORDER BY CAST(
//       SUBSTRING_INDEX(COALESCE(cpp.custom_price, p.base_price), '-', 1)
//     AS DECIMAL(10,2)) DESC
//   `;
// }

//     const [rows] = await db.query(
//       `
//       SELECT
//         p.id,
       
//   CASE 
//     WHEN cpp.prefix IS NOT NULL AND cpp.prefix != ''
//     THEN CONCAT(cpp.prefix, ' | ', p.product_name)
//     ELSE p.product_name
//   END AS product_name,
//         p.base_price,
//         COALESCE(cpp.custom_price, p.base_price) AS final_price,
//         p.stock_qty,
//         p.featured_image
//       FROM product_catalog_map pcm
//       INNER JOIN products p 
//         ON p.id = pcm.product_id
//       LEFT JOIN company_product_pricing cpp
//         ON cpp.product_id = p.id
//        AND cpp.company_id = ?
//       ${where}
//       GROUP BY p.id
//       ${orderBy}
//       `,
//       [companyId, ...values]
//     );

//      return NextResponse.json({
//       breadcrumb: {
//         dashboard: "Home",
//         catalogName: catalog?.name || "Catalog",
//         products: "Products"
//       },
//       products: rows
//     });

//   } catch (error) {
//     console.error("Products API Error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch products" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(req) {
  try {

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const stock = searchParams.get("stock");
    const sort = searchParams.get("sort") || "latest";
    const catalogId = searchParams.get("catalogId");

    /* ================= AUTH ================= */

    let decoded;

    try {

      decoded = verifyToken(req);

    } catch (err) {

      console.error(
        "Auth error:",
        err.message
      );

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      companyId,
      customerId,
      userType,
    } = decoded;

    /* ================= VALIDATION ================= */

    if (!catalogId) {

      return NextResponse.json(
        [],
        { status: 200 }
      );
    }

    /* ================= CATALOG ================= */

    const [catalogRows] = await db.query(
      `
      SELECT name
      FROM catalogs
      WHERE id = ?
      LIMIT 1
      `,
      [catalogId]
    );

    const catalog =
      catalogRows?.[0] || null;

    const isPopularCatalog =
  catalog?.name === "Popular Products";

    /* ================= FILTERS ================= */

    let where = `
      WHERE pcm.catalog_id = ?
    `;

    const values = [catalogId];

    if (search) {

      where += `
        AND (
          p.product_name LIKE ?
          OR p.barcode LIKE ?
        )
      `;

      values.push(
        `%${search}%`,
        `%${search}%`
      );
    }

    if (stock === "in") {
      where += `
        AND p.stock_qty > 0
      `;
    }

    if (stock === "out") {
      where += `
        AND p.stock_qty = 0
      `;
    }

    /* ================= SORT ================= */

    let orderBy = `
      ORDER BY p.created_at DESC
    `;

    if (sort === "price_asc") {

      orderBy = `
        ORDER BY

        CAST(

          SUBSTRING_INDEX(

            CASE

              WHEN '${userType}' = 'B2B'
              THEN COALESCE(
                cpp.custom_price,
                p.base_price
              )

              WHEN '${userType}' = 'B2C'
              THEN COALESCE(
                custp.custom_price,
                p.base_price
              )

              ELSE p.base_price

            END,

          '-', 1)

        AS DECIMAL(10,2)) ASC
      `;
    }

    if (sort === "price_desc") {

      orderBy = `
        ORDER BY

        CAST(

          SUBSTRING_INDEX(

            CASE

              WHEN '${userType}' = 'B2B'
              THEN COALESCE(
                cpp.custom_price,
                p.base_price
              )

              WHEN '${userType}' = 'B2C'
              THEN COALESCE(
                custp.custom_price,
                p.base_price
              )

              ELSE p.base_price

            END,

          '-', 1)

        AS DECIMAL(10,2)) DESC
      `;
    }

let rows = [];

if (isPopularCatalog) {

  const [popularRows] = await db.query(
    `
    SELECT
      p.id,

      CASE
        WHEN cpp.prefix IS NOT NULL
         AND cpp.prefix != ''
        THEN CONCAT(cpp.prefix, ' | ', p.product_name)
        ELSE p.product_name
      END AS product_name,

      p.base_price,

      CASE
        WHEN ? = 'B2B'
        THEN COALESCE(cpp.custom_price, p.base_price)

        WHEN ? = 'B2C'
        THEN COALESCE(custp.custom_price, p.base_price)

        ELSE p.base_price
      END AS final_price,

      p.stock_qty,
      p.featured_image,

      SUM(ii.quantity) AS totalSold

    FROM invoice_items ii

    INNER JOIN products p
      ON p.id = ii.product_id

    LEFT JOIN company_product_pricing cpp
      ON cpp.product_id = p.id
     AND cpp.company_id = ?

    LEFT JOIN customer_product_pricing custp
      ON custp.product_id = p.id
     AND custp.customer_id = ?

    WHERE ii.is_charge = 0

    GROUP BY
      p.id,
      p.product_name,
      cpp.prefix,
      p.base_price,
      p.stock_qty,
      p.featured_image

    ORDER BY totalSold DESC
    `
    ,
    [
      userType,
      userType,
      companyId || 0,
      customerId || 0,
    ]
  );

  rows = popularRows;

} else {

  const [manualRows] = await db.query(
    `
    SELECT

      p.id,

      CASE

        WHEN cpp.prefix IS NOT NULL
         AND cpp.prefix != ''

        THEN CONCAT(
          cpp.prefix,
          ' | ',
          p.product_name
        )

        ELSE p.product_name

      END AS product_name,

      p.base_price,

      CASE

        WHEN ? = 'B2B'

        THEN COALESCE(
          cpp.custom_price,
          p.base_price
        )

        WHEN ? = 'B2C'

        THEN COALESCE(
          custp.custom_price,
          p.base_price
        )

        ELSE p.base_price

      END AS final_price,

      p.stock_qty,
      p.featured_image

    FROM product_catalog_map pcm

    INNER JOIN products p
      ON p.id = pcm.product_id

    LEFT JOIN company_product_pricing cpp
      ON cpp.product_id = p.id
     AND cpp.company_id = ?

    LEFT JOIN customer_product_pricing custp
      ON custp.product_id = p.id
     AND custp.customer_id = ?

    ${where}

    GROUP BY p.id

    ${orderBy}
    `,
    [
      userType,
      userType,
      companyId || 0,
      customerId || 0,
      ...values,
    ]
  );

  rows = manualRows;
}

 

    /* ================= RESPONSE ================= */

    return NextResponse.json({

      breadcrumb: {
        dashboard: "Home",
        catalogName:
          catalog?.name || "Catalog",
        products: "Products",
      },

      products: rows,
    });

  } catch (error) {

    console.error(
      "Products API Error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}
