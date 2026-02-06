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

    const { companyId } = decoded;

    /* ===== OPEN RFQs ===== */
    const [[openRFQs]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM rfqs
      WHERE company_id = ?
        AND status IN ('Submitted', 'Under Review')
      `,
      [companyId]
    );

    /* ===== PENDING PROPOSALS ===== */
    const [[pendingProposals]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM proposals
      WHERE company_id = ?
        AND status = 'Pending'
      `,
      [companyId]
    );

    /* ===== ACCEPTED RFQs ===== */
    const [[acceptedRFQs]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM rfqs
      WHERE company_id = ?
        AND status = 'Accepted'
      `,
      [companyId]
    );

    /* ===== REJECTED RFQs ===== */
    const [[rejectedRFQs]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM rfqs
      WHERE company_id = ?
        AND status = 'Rejected'
      `,
      [companyId]
    );

    return NextResponse.json({
      openRFQs: openRFQs.count ?? 0,
      acceptedRFQs: acceptedRFQs.count ?? 0,
      pendingProposals: pendingProposals.count ?? 0,
      rejectedRFQs: rejectedRFQs.count ?? 0,
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

