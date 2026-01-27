import { NextResponse } from "next/server";
import { db } from "../../../db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT id, name
      FROM catalogs
      ORDER BY id ASC
    `);

    return NextResponse.json(rows);

  } catch (error) {
    console.error("Categories API Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
