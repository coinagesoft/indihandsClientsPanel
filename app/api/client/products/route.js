import { NextResponse } from "next/server";
import { db } from "../../../db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const companyId = 1; // TODO: from auth
    const search = searchParams.get("search") || "";
    const catalogId = searchParams.get("catalogId");
    const stock = searchParams.get("stock"); // in | out
    const sort = searchParams.get("sort");   // price_asc | price_desc | latest

    let where = `WHERE p.status = 'active'`;
    const values = [];

    /* 🔍 SEARCH */
    if (search) {
      where += ` AND p.product_name LIKE ?`;
      values.push(`%${search}%`);
    }

    /* 📦 STOCK FILTER */
    if (stock === "in") {
      where += ` AND p.stock_qty > 0`;
    }
    if (stock === "out") {
      where += ` AND p.stock_qty = 0`;
    }

    /* 📚 CATALOG FILTER */
    if (catalogId) {
      where += ` AND pcm.catalog_id = ?`;
      values.push(catalogId);
    }

    /* 🔃 SORTING */
    let orderBy = "ORDER BY p.created_at DESC";
    if (sort === "price_asc") orderBy = "ORDER BY p.base_price ASC";
    if (sort === "price_desc") orderBy = "ORDER BY p.base_price DESC";

    const [rows] = await db.query(
      `
      SELECT
        p.id,
        p.product_name,
        p.base_price,
        p.stock_qty,
        p.featured_image
      FROM products p
      LEFT JOIN product_catalog_map pcm ON pcm.product_id = p.id
      ${where}
      ${orderBy}
      `,
      values
    );

    return NextResponse.json(rows);

  } catch (error) {
    console.error("Products API Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
