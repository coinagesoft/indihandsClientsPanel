import { NextResponse } from "next/server";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    /* ===== AUTH ===== */
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = decoded;

    let where = `WHERE 1=1`;
    const values = [];

    // ✅ GLOBAL SEARCH (ALL CATALOGS)
    if (search) {
      where += `
        AND (
          p.product_name LIKE ?
          OR p.barcode LIKE ?
        )
      `;
values.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await db.query(
      `
      SELECT
        p.id,
        p.product_name,
        p.base_price,
          p.barcode, 
        COALESCE(cpp.custom_price, p.base_price) AS final_price,
        p.featured_image
      FROM products p
      LEFT JOIN company_product_pricing cpp
        ON cpp.product_id = p.id
       AND cpp.company_id = ?
      ${where}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      `,
      [companyId, ...values]
    );

    return NextResponse.json({ products: rows });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}