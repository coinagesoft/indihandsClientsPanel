import { NextResponse } from "next/server";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";

export async function POST(req) {
  try {
  let decoded;
  const { address } = await req.json();
       try {
         decoded = verifyToken(req);
       } catch {
         return NextResponse.json(
           { error: "Unauthorized" },
           { status: 401 }
         );
       }
     const { companyId, branchId } = decoded;

    if (!address?.trim()) {
      return NextResponse.json(
        { error: "Address required" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `
      INSERT INTO company_branches (company_id, shipping_address)
      VALUES (?, ?)
      `,
      [companyId, address]
    );

    return NextResponse.json({
      id: result.insertId,
      shipping_address: address
    });

  } catch (error) {
    console.error("Add Shipping Address Error:", error);
    return NextResponse.json(
      { error: "Failed to add address" },
      { status: 500 }
    );
  }
}
