import { NextResponse } from "next/server";
import { db } from "../../../../db";

export async function GET() {
  try {
    const companyId = 1;

    const [[openRFQs]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM rfqs
      WHERE company_id = ?
      AND status IN ('Submitted', 'Under Review')
      `,
      [companyId]
    );

    const [[pendingProposals]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM proposals
      WHERE company_id = ?
      AND status = 'Pending'
      `,
      [companyId]
    );

    const [[acceptedRFQs]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM rfqs
      WHERE company_id = ?
      AND status = 'Accepted'
      `,
      [companyId]
    );

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
      openRFQs: openRFQs.count,
      acceptedRFQs: acceptedRFQs.count,
      pendingProposals: pendingProposals.count,
      rejectedRFQs: rejectedRFQs.count,
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
