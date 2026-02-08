import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { verifyToken } from "../../../../lib/auth";

export async function DELETE(req, { params }) {
  try {
    /* ===== AUTH ===== */
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { companyId, branchId } = decoded;
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID missing" },
        { status: 400 }
      );
    }

    /* 1️⃣ FIND DRAFT RFQ (company + branch scoped) */
    const [[rfq]] = await db.query(
      `
      SELECT id
      FROM rfqs
      WHERE company_id = ?
        AND branch_id = ?
        AND status = 'Draft'
      LIMIT 1
      `,
      [companyId, branchId]
    );

    if (!rfq) {
      // cart already empty – safe no-op
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

