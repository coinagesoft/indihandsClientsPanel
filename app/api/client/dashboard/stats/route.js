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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, branchId } = decoded;

    /* ===== OPEN RFQs ===== */
    const [[openRFQs]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM rfqs
      WHERE company_id = ?
        AND branch_id = ?
        AND status IN ('Submitted', 'Under Review')
      `,
      [companyId, branchId]
    );

    /* ===== ACCEPTED RFQs ===== */
    const [[acceptedRFQs]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM rfqs
      WHERE company_id = ?
        AND branch_id = ?
        AND status = 'Accepted'
      `,
      [companyId, branchId]
    );

    /* ===== REJECTED RFQs ===== */
    const [[rejectedRFQs]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM rfqs
      WHERE company_id = ?
        AND branch_id = ?
        AND status = 'Rejected'
      `,
      [companyId, branchId]
    );

    /* ===== PENDING PROPOSALS (linked to branch RFQs) ===== */
    const [[pendingProposals]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM proposals p
      JOIN rfqs r ON r.id = p.rfq_id
      WHERE p.company_id = ?
        AND r.branch_id = ?
        AND p.status = 'Pending'
      `,
      [companyId, branchId]
    );

    return NextResponse.json({
      openRFQs: openRFQs.count || 0,
      acceptedRFQs: acceptedRFQs.count || 0,
      rejectedRFQs: rejectedRFQs.count || 0,
      pendingProposals: pendingProposals.count || 0,
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
