import { NextResponse } from "next/server";
import { db } from "../../../db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT id, name
      FROM categories
      ORDER BY name ASC
    `);

    return NextResponse.json(rows); // ✅ return array ONLY
  } catch (error) {
    console.error("Categories API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
