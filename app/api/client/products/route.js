import { NextResponse } from "next/server";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const stock = searchParams.get("stock");
    const sort = searchParams.get("sort") || "latest";
    const catalogId = searchParams.get("catalogId");

 /* ===== AUTH ===== */
       let decoded;
       try {
         decoded = verifyToken(req);
       } catch (err) {
         console.error("Auth error:", err.message);
         return NextResponse.json(
           { error: "Unauthorized" },
           { status: 401 }
         );
       }
   
       const { companyId} = decoded; 

    if (!catalogId) {
      return NextResponse.json([], { status: 200 });
    }

   const [catalogRows] = await db.query(
  `SELECT name FROM catalogs WHERE id = ? LIMIT 1`,
  [catalogId]
);

const catalog = catalogRows?.[0] || null;

    let where = `WHERE pcm.catalog_id = ?`;
    const values = [catalogId];
  

    if (search) {
      where += ` AND p.product_name LIKE ?`;
      values.push(`%${search}%`);
    }


    if (stock === "in") where += ` AND p.stock_qty > 0`;
    if (stock === "out") where += ` AND p.stock_qty = 0`;

    /* ================= SORT ================= */
    let orderBy = `ORDER BY p.created_at DESC`;

    if (sort === "price_asc") orderBy = `ORDER BY final_price ASC`;
    if (sort === "price_desc") orderBy = `ORDER BY final_price DESC`;

    const [rows] = await db.query(
      `
      SELECT
        p.id,
        p.product_name,
        p.base_price,
        COALESCE(cpp.custom_price, p.base_price) AS final_price,
        p.stock_qty,
        p.featured_image
      FROM product_catalog_map pcm
      INNER JOIN products p 
        ON p.id = pcm.product_id
      LEFT JOIN company_product_pricing cpp
        ON cpp.product_id = p.id
       AND cpp.company_id = ?
      ${where}
      GROUP BY p.id
      ${orderBy}
      `,
      [companyId, ...values]
    );

     return NextResponse.json({
      breadcrumb: {
        dashboard: "Home",
        catalogName: catalog?.name || "Catalog",
        products: "Products"
      },
      products: rows
    });

  } catch (error) {
    console.error("Products API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
