export const runtime = "nodejs";
import { db } from "../../../db";

export async function POST(req) {
  try {
    const { proposalId, status } = await req.json();
    const companyId = 1; // TODO: auth

    if (!proposalId || !["Approved", "Rejected"].includes(status)) {
      return Response.json(
        { message: "Invalid request" },
        { status: 400 }
      );
    }

    const [[proposal]] = await db.query(
      `
      SELECT id, status
      FROM proposals
      WHERE id = ? AND company_id = ?
      `,
      [proposalId, companyId]
    );

    if (!proposal) {
      return Response.json(
        { message: "Proposal not found" },
        { status: 404 }
      );
    }

    if (["Approved", "Rejected"].includes(proposal.status)) {
      return Response.json(
        { message: "Proposal already finalized" },
        { status: 400 }
      );
    }

    await db.query(
      `
      UPDATE proposals
      SET status = ?
      WHERE id = ?
      `,
      [status, proposalId]
    );

    return Response.json({ success: true });

  } catch (err) {
    console.error("proposal-status error:", err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
