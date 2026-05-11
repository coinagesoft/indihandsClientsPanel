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
      customerId,
      userType
    } = decoded;

    /* ===== COMMON FILTER ===== */

    let rfqWhere = "";
    let rfqParams = [];

    if (userType === "B2B") {

      rfqWhere = `
        company_id = ?
        AND branch_id = ?
        AND rfq_type = 'B2B'
      `;

      rfqParams = [companyId, branchId];
    }

    if (userType === "B2C") {

      rfqWhere = `
        customer_id = ?
        AND rfq_type = 'B2C'
      `;

      rfqParams = [customerId];
    }

    /* ===== OPEN RFQs ===== */

    const [[openRFQs]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM rfqs
      WHERE ${rfqWhere}
        AND status IN (
          'Submitted',
          'Under Review'
        )
      `,
      rfqParams
    );

    /* ===== ACCEPTED RFQs ===== */

    const [[acceptedRFQs]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM rfqs
      WHERE ${rfqWhere}
        AND status = 'Accepted'
      `,
      rfqParams
    );

    /* ===== REJECTED RFQs ===== */

    const [[rejectedRFQs]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM rfqs
      WHERE ${rfqWhere}
        AND status = 'Rejected'
      `,
      rfqParams
    );

    /* ===== PENDING PROPOSALS ===== */

    let proposalWhere = "";
    let proposalParams = [];

    if (userType === "B2B") {

      proposalWhere = `
        p.company_id = ?
        AND r.branch_id = ?
        AND r.rfq_type = 'B2B'
      `;

      proposalParams = [companyId, branchId];
    }

    if (userType === "B2C") {

      proposalWhere = `
        r.customer_id = ?
        AND r.rfq_type = 'B2C'
      `;

      proposalParams = [customerId];
    }

    const [[pendingProposals]] = await db.query(
      `
      SELECT COUNT(*) AS count
      FROM proposals p

      JOIN rfqs r
        ON r.id = p.rfq_id

      WHERE ${proposalWhere}
        AND p.status = 'Pending'
      `,
      proposalParams
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