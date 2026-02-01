import { NextResponse } from "next/server";
import { db } from "../../../db";

export async function POST() {
  try {
    const companyId = 1; // TODO: from auth
    const branchId = 1;  // TODO: from auth

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
      return NextResponse.json(
        { error: "No draft RFQ found" },
        { status: 400 }
      );
    }

    /* 2️⃣ CHECK IF CART HAS ITEMS */
    const [[count]] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM rfq_products
      WHERE rfq_id = ?
      `,
      [rfq.id]
    );

    if (count.total === 0) {
      return NextResponse.json(
        { error: "Cannot submit empty RFQ" },
        { status: 400 }
      );
    }

    /* 3️⃣ SUBMIT RFQ */
    await db.query(
      `
      UPDATE rfqs
      SET status = 'Submitted',
          submitted_at = NOW()
      WHERE id = ?
      `,
      [rfq.id]
    );

    return NextResponse.json({
      success: true,
      rfq_id: rfq.id,
      message: "RFQ submitted successfully",
    });

  } catch (error) {
    console.error("Submit RFQ Error:", error);
    return NextResponse.json(
      { error: "Failed to submit RFQ" },
      { status: 500 }
    );
  }
}
