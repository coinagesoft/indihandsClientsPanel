export const runtime = "nodejs";
import { db } from "../../../db";

export async function GET() {
  try {
    const companyId = 1; // TODO: from auth/session

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
      ORDER BY r.id DESC
      `,
      [companyId, companyId]
    );

    return Response.json(rows);

  } catch (err) {
    console.error("RFQ dropdown API error:", err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
