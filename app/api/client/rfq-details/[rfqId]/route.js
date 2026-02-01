import { NextResponse } from "next/server";
import { db } from "../../../../db";

export async function GET(req, { params }) {
  try {
    const { rfqId } = await params;
    const companyId = 1;
    const branchId = 1;

    /* RFQ HEADER */
    const [[rfq]] = await db.query(
      `
      SELECT
        id,
        status,
        submitted_at,
        notes
      FROM rfqs
      WHERE id = ?
        AND company_id = ?
        AND branch_id = ?
      LIMIT 1
      `,
      [rfqId, companyId, branchId]
    );

    if (!rfq) {
      return NextResponse.json(
        { error: "RFQ not found" },
        { status: 404 }
      );
    }

    /* RFQ PRODUCTS */
    const [items] = await db.query(
      `
      SELECT
        p.product_name,
        rp.quantity,
        rp.quoted_price,
        (rp.quantity * rp.quoted_price) AS total
      FROM rfq_products rp
      JOIN products p ON p.id = rp.product_id
      WHERE rp.rfq_id = ?
      `,
      [rfqId]
    );

    return NextResponse.json({
      rfq,
      items
    });

  } catch (error) {
    console.error("RFQ Details API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch RFQ details" },
      { status: 500 }
    );
  }
}

