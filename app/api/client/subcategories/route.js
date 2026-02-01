import { NextResponse } from "next/server";
import { db } from "../../../db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json([]);
    }

    const [rows] = await db.query(
      `
      SELECT id, name
      FROM subcategories
      WHERE category_id = ?
      ORDER BY name ASC
      `,
      [categoryId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Subcategories API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}
