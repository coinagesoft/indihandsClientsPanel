import { NextResponse } from "next/server";
import { db } from "../../../../db";

export async function GET() {
  try {
    const companyId = 1;

    const [rows] = await db.query(
      `
      SELECT
        r.id,
        b.branch_name AS branch,
        DATE_FORMAT(r.submitted_at, '%d-%m-%Y') AS submittedAt,
        r.status,
        r.notes,
        COALESCE(SUM(rp.quantity), 0) AS items
      FROM rfqs r
      INNER JOIN company_branches b 
        ON r.branch_id = b.id
      LEFT JOIN rfq_products rp 
        ON rp.rfq_id = r.id
      WHERE r.company_id = ?
      GROUP BY r.id
      ORDER BY r.submitted_at DESC
      LIMIT 5
      `,
      [companyId]
    );

    return NextResponse.json(rows); // ✅ array returned

  } catch (error) {
    console.error("Recent RFQs API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
