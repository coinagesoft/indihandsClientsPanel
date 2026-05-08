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

    const {
      companyId,
      branchId,
      userType
    } = decoded;

    /* ===== USER TYPE FILTER ===== */

    let rfqTypeFilter = "";

    if (userType === "B2B") {
      rfqTypeFilter =
        ` AND rfq_type = 'B2B' `;
    }

    if (userType === "B2C") {
      rfqTypeFilter =
        ` AND rfq_type = 'B2C' `;
    }

    /* ===== OPEN RFQs ===== */

    const [[openRFQs]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM rfqs
      WHERE company_id = ?
        AND branch_id = ?
        ${rfqTypeFilter}
        AND status IN (
          'Submitted',
          'Under Review'
        )
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
        ${rfqTypeFilter}
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
        ${rfqTypeFilter}
        AND status = 'Rejected'
      `,
      [companyId, branchId]
    );

    /* ===== PENDING PROPOSALS ===== */

    const [[pendingProposals]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM proposals p

      JOIN rfqs r
        ON r.id = p.rfq_id

      WHERE p.company_id = ?
        AND r.branch_id = ?
        ${userType === "B2B"
          ? "AND r.rfq_type = 'B2B'"
          : ""
        }
        ${userType === "B2C"
          ? "AND r.rfq_type = 'B2C'"
          : ""
        }
        AND p.status = 'Pending'
      `,
      [companyId, branchId]
    );

    return NextResponse.json({

      openRFQs:
        openRFQs.count || 0,

      acceptedRFQs:
        acceptedRFQs.count || 0,

      rejectedRFQs:
        rejectedRFQs.count || 0,

      pendingProposals:
        pendingProposals.count || 0,
    });

  } catch (error) {

    console.error(
      "Dashboard Stats Error:",
      error
    );

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}