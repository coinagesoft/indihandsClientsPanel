import { NextResponse } from "next/server";
import { db } from "../../../../db";

export async function DELETE(req, { params }) {
  try {
    const { productId } = await params;
    const companyId = 1; // TODO: from auth/session

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID missing" },
        { status: 400 }
      );
    }

    /* 1️⃣ FIND DRAFT RFQ */
    const [[rfq]] = await db.query(
      `
      SELECT id
      FROM rfqs
      WHERE company_id = ?
        AND status = 'Draft'
      LIMIT 1
      `,
      [companyId]
    );

    if (!rfq) {
      return NextResponse.json({ success: true });
    }

    /* 2️⃣ DELETE PRODUCT FROM CART */
    await db.query(
      `
      DELETE FROM rfq_products
      WHERE rfq_id = ? AND product_id = ?
      `,
      [rfq.id, productId]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete Cart Item Error:", error);
    return NextResponse.json(
      { error: "Failed to remove item" },
      { status: 500 }
    );
  }
}
