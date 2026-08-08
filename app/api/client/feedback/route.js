import { NextResponse } from "next/server";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";

export async function POST(req) {
  try {
    /* ================= AUTH ================= */

    let decoded;

    try {
      decoded = verifyToken(req);
    } catch (err) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      companyId,
      branchId,
      customerId,
      userType,
    } = decoded;

    /* ================= REQUEST ================= */

    const {
      proposalId,
      rating,
      comments,
    } = await req.json();

    if (!proposalId) {
      return NextResponse.json(
        { message: "Proposal is required." },
        { status: 400 }
      );
    }

    if (!rating && !comments?.trim()) {
      return NextResponse.json(
        {
          message:
            "Please provide rating or feedback."
        },
        { status: 400 }
      );
    }

    /* ================= PROPOSAL ================= */

    const [proposalRows] = await db.query(
      `
      SELECT
        id,
        invoice_id,
        status,
        company_id,
        branch_id,
        customer_id
      FROM proposals
      WHERE id = ?
      LIMIT 1
      `,
      [proposalId]
    );

    if (!proposalRows.length) {
      return NextResponse.json(
        {
          message: "Proposal not found."
        },
        {
          status: 404
        }
      );
    }

    const proposal = proposalRows[0];

    if (proposal.status !== "Approved") {
      return NextResponse.json(
        {
          message:
            "Feedback can only be submitted after approval."
        },
        {
          status: 400
        }
      );
    }

    /* ================= OWNERSHIP ================= */

    if (userType === "B2B") {
      if (proposal.branch_id != branchId) {
        return NextResponse.json(
          {
            message: "Access denied."
          },
          {
            status: 403
          }
        );
      }
    }

    if (userType === "B2C") {
      if (proposal.customer_id != customerId) {
        return NextResponse.json(
          {
            message: "Access denied."
          },
          {
            status: 403
          }
        );
      }
    }

   

    /* ================= INSERT ================= */

   await db.query(
  `
  INSERT INTO feedbacks
  (
    proposal_id,
    invoice_id,
    feedback_source,
    client_type,
    buyer_company_id,
    buyer_branch_id,
    customer_id,
    rating,
    comments,
    submitted_at
  )
  VALUES
  (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
  )
  `,
  [
    proposal.id,
    proposal.invoice_id,
    "Proposal",
    userType,
    proposal.company_id,
    proposal.branch_id,
    proposal.customer_id,
    rating || null,
    comments || null,
  ]
);

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully."
    });

  } catch (err) {
    console.error("Feedback API Error:", err);

    return NextResponse.json(
      {
        message: "Server error"
      },
      {
        status: 500
      }
    );
  }
}