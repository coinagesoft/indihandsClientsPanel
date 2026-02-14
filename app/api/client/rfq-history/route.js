import { NextResponse } from "next/server";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";

export async function GET(req) {
  try {
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch (err) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { companyId, branchId } = decoded;

    const [rows] = await db.query(
      `
      SELECT
        r.id AS rfq_id,
        r.rfq_number,
        r.status,
        r.submitted_at AS created_date,

        r.client_name,
        r.client_phone,
        r.client_email,

        COALESCE(SUM(rp.quantity), 0) AS total_items,
        COALESCE(SUM(rp.quantity * rp.quoted_price), 0) AS total_amount

      FROM rfqs r
      LEFT JOIN rfq_products rp ON rp.rfq_id = r.id
      WHERE r.company_id = ?
        AND r.branch_id = ?
        AND r.status != 'Draft'

      GROUP BY 
        r.id,
        r.rfq_number,
        r.status,
        r.submitted_at,
        r.client_name,
        r.client_phone,
        r.client_email

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





