export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";



export async function GET(req) {

  try {

    /* ===== AUTH ===== */

    let decoded;

    try {

      decoded = verifyToken(req);

    } catch (err) {

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {

      companyId,

      branchId,

      customerId,

      userType,

    } = decoded;

    /* ===== RFQ + PROPOSALS ===== */

    const [rows] = await db.query(
      `
      SELECT

        r.id AS rfq_id,

        r.rfq_number,

        r.rfq_type,

        r.client_name,

        r.client_phone,

        r.client_email,

        p.id AS proposal_id,

        p.proposal_number,

        p.status,

        p.proposal_type,

        c.company_name AS company

      FROM rfqs r

      JOIN proposals p
        ON p.rfq_id = r.id

      LEFT JOIN companies c
        ON c.id = p.company_id

      WHERE

      (
        (
          ? = 'B2B'

          AND p.company_id = ?

          AND r.branch_id = ?
        )

        OR

        (
          ? = 'B2C'

          AND p.customer_id = ?
        )
      )

    AND p.status IN
(
  'Pending',
  'Approved',
  'Sent',
  'Rejected',
  'Paid'
)

      ORDER BY r.id DESC
      `,
      [

        userType,
        companyId || 0,
        branchId || 0,

        userType,
        customerId || 0,
      ]
    );

    return NextResponse.json(rows);

  } catch (err) {

    console.error(
      "RFQ dropdown API error:",
      err
    );

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

