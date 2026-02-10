import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req) {
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

    /* ===== RECENT RFQs (BRANCH-WISE) ===== */
  const [rows] = await db.query(
  `
  SELECT
    r.id,
    r.rfq_number,
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
    AND r.branch_id = ?
  GROUP BY 
    r.id,
    r.rfq_number,
    b.branch_name,
    r.submitted_at,
    r.status,
    r.notes
  ORDER BY r.submitted_at DESC
  LIMIT 5
  `,
  [companyId, branchId]
);


    return NextResponse.json(rows);

  } catch (error) {
    console.error("Recent RFQs API Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
