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

    const { companyId, branchId } = decoded;

    /* ===== RFQ + PROPOSALS (BRANCH SCOPED) ===== */
    const [rows] = await db.query(
      `
      SELECT
        r.id AS rfq_id,
        p.id AS proposal_id,
        p.proposal_number,
        p.status
      FROM rfqs r
      JOIN proposals p 
        ON p.rfq_id = r.id
       AND p.company_id = ?
       AND p.status IN ('Pending','Approved')
      WHERE r.company_id = ?
        AND r.branch_id = ?
      ORDER BY r.id DESC
      `,
      [companyId, companyId, branchId]
    );

    return NextResponse.json(rows);

  } catch (err) {
    console.error("RFQ dropdown API error:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

