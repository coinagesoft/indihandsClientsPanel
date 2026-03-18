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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, branchId } = decoded;
    const { productId } =await params;

    if (!productId) {
      return NextResponse.json({ error: "Product ID missing" }, { status: 400 });
    }

    /* 1️⃣ FIND DRAFT RFQ */
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
      return NextResponse.json({ success: true });
    }

    /* 2️⃣ DELETE PRODUCT FROM RFQ */
    await db.query(
      `
      DELETE FROM rfq_products
      WHERE rfq_id = ? AND product_id = ?
      `,
      [rfq.id, productId]
    );

    /* 3️⃣ CHECK IF RFQ HAS PRODUCTS LEFT */
    const [[count]] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM rfq_products
      WHERE rfq_id = ?
      `,
      [rfq.id]
    );

    /* 4️⃣ DELETE RFQ IF EMPTY */
    if (count.total === 0) {
      await db.query(
        `
        DELETE FROM rfqs
        WHERE id = ?
        `,
        [rfq.id]
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Delete Cart Item Error:", error);
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}