import { NextResponse } from "next/server";
import { db } from "../../../db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        c.id,
        c.name AS title,
        c.featured_image,
        c.description,
        COUNT(pcm.product_id) AS productCount
      FROM catalogs c
      LEFT JOIN product_catalog_map pcm
        ON pcm.catalog_id = c.id
      GROUP BY 
        c.id,
        c.name,
        c.featured_image,
        c.description
      ORDER BY c.id ASC
    `);

    const data = rows.map(row => ({
      id: row.id,
      title: row.title,
      image: row.featured_image,
      desc: row.description,          // ✅ FROM DB
      productCount: row.productCount,
    }));

    return NextResponse.json(data);

  } catch (error) {
    console.error("Catalog API Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
