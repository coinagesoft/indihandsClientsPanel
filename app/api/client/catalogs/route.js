import { NextResponse } from "next/server";
import { db } from "../../../db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        c.id,
        c.name AS title,
        COUNT(pcm.product_id) AS productCount
      FROM catalogs c
      LEFT JOIN product_catalog_map pcm
        ON pcm.catalog_id = c.id
      GROUP BY c.id
      ORDER BY c.id ASC
    `);

    // Optional descriptions (can later move to DB)
    const descriptionMap = {
      "indiHands—The Stationery Edition":
        "Art-led desk essentials for thoughtful gifting.",
      "The Thoughtful Edition (Up to ₹1,000)":
        "Gifts that feel personal and refined.",
      "The Executive Edition (₹1,000 — ₹2,000)":
        "Premium gifts for corporate moments.",
      "The Signature Edition (₹2,000 — ₹5,000)":
        "Distinctive gifts to stand out.",
      "The Prestige Edition (₹5,000 — ₹8,000)":
        "Impressive gifting for senior leadership.",
      "The Legacy Edition (₹8,000 & Above)":
        "Heirloom-level gifting experiences.",
    };

    const data = rows.map(row => ({
      id: row.id,
      title: row.title,
      desc: descriptionMap[row.title] || "Curated gifting collection.",
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
