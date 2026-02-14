import { NextResponse } from "next/server";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";


export async function POST(req) {
  try {
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, branchId } = decoded;

    const body = await req.json();
    const { clientName, clientPhone, clientEmail } = body;

    if (!clientName?.trim())
      return NextResponse.json({ error: "Client name required" }, { status: 400 });

    /* FIND DRAFT RFQ */
    const [[rfq]] = await db.query(
      `SELECT id FROM rfqs
       WHERE company_id=? AND branch_id=? AND status='Draft'
       LIMIT 1`,
      [companyId, branchId]
    );

    if (!rfq) {
      return NextResponse.json({ error: "No draft RFQ found" }, { status: 400 });
    }

    /* CHECK CART */
    const [[count]] = await db.query(
      `SELECT COUNT(*) AS total FROM rfq_products WHERE rfq_id=?`,
      [rfq.id]
    );

    if (count.total === 0) {
      return NextResponse.json({ error: "Cannot submit empty RFQ" }, { status: 400 });
    }

    /* SUBMIT RFQ + SAVE CLIENT */
    await db.query(
      `UPDATE rfqs
       SET status='Submitted',
           submitted_at=NOW(),
           client_name=?,
           client_phone=?,
           client_email=?
       WHERE id=?`,
      [clientName, clientPhone, clientEmail, rfq.id]
    );

    return NextResponse.json({
      success: true,
      rfq_id: rfq.id,
      message: "RFQ submitted successfully",
    });

  } catch (error) {
    console.error("Submit RFQ Error:", error);
    return NextResponse.json(
      { error: "Failed to submit RFQ" },
      { status: 500 }
    );
  }
}


