import { NextResponse } from "next/server";
import { db } from "../../../../db";

export async function DELETE(req, { params }) {
  try {
    const companyId = 1; // TODO: from auth
    const addressId = params.id;

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
