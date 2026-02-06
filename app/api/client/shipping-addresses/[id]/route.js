import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { verifyToken } from "../../../../lib/auth";

export async function DELETE(req, { params }) {
  try {
  let decoded;
  const addressId = params.id;
       try {
         decoded = verifyToken(req);
       } catch {
         return NextResponse.json(
           { error: "Unauthorized" },
           { status: 401 }
         );
       }
     const { companyId, branchId } = decoded;

    await db.query(
      `
      DELETE FROM company_branches
      WHERE id = ? AND company_id = ?
      `,
      [addressId, companyId]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete Shipping Address Error:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
