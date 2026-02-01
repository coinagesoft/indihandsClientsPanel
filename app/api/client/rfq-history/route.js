import { NextResponse } from "next/server";
import { db } from "../../../db";

export async function GET() {
  try {
    const companyId = 1;
    const branchId = 1;

    const [rows] = await db.query(
      `
      SELECT
        r.id AS rfq_id,
        r.status,
        r.submitted_at AS created_date,
        COALESCE(SUM(rp.quantity), 0) AS total_items,
        COALESCE(SUM(rp.quantity * rp.quoted_price), 0) AS total_amount
      FROM rfqs r
      LEFT JOIN rfq_products rp ON rp.rfq_id = r.id
      WHERE r.company_id = ?
        AND r.branch_id = ?
        AND r.status != 'Draft'
      GROUP BY r.id, r.status, r.submitted_at
      ORDER BY r.submitted_at DESC
      `,
      [companyId, branchId]
    );

    return NextResponse.json({ rfqs: rows });

  } catch (error) {
    console.error("RFQ History API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch RFQ history" },
      { status: 500 }
    );
  }
}


