export const runtime = "nodejs";
import { db } from "../../../../db";

export async function GET(req, { params }) {
  try {
    const { rfqId } = await params;
    const rfq_id = Number(rfqId);
    const companyId = 1; // TODO: from auth

    if (!rfq_id) {
      return Response.json({ proposal: null });
    }

    /* ================= PROPOSAL ================= */
    const [[proposal]] = await db.query(
      `
      SELECT
        p.id,
        p.rfq_id,
        p.proposal_number,
        p.proposal_date,
        p.billing_address,
        p.shipping_address,
        p.place,
        p.subtotal,
        p.cgst_total,
        p.sgst_total,
        p.igst_total,
        p.grand_total,
        p.status
      FROM proposals p
      WHERE p.rfq_id = ? AND p.company_id = ?
      LIMIT 1
      `,
      [rfq_id, companyId]
    );

    if (!proposal) {
      return Response.json({ proposal: null });
    }

    /* ================= ITEMS ================= */
    const [items] = await db.query(
      `
      SELECT
        pr.product_name        AS description,
        pr.sku                 AS product_code,
        pr.hsn                 AS hsn,
        pr.featured_image      AS featured_image,
        pi.quantity            AS qty,
        pi.rate                AS rate,
        pi.line_total          AS total
      FROM proposal_items pi
      JOIN products pr ON pr.id = pi.product_id
      WHERE pi.proposal_id = ?
      ORDER BY pi.id ASC
      `,
      [proposal.id]
    );

    /* ================= RESPONSE ================= */
    return Response.json({
      proposal: {
        ...proposal,
        subtotal: Number(proposal.subtotal),
        cgst_total: Number(proposal.cgst_total),
        sgst_total: Number(proposal.sgst_total),
        igst_total: Number(proposal.igst_total),
        grand_total: Number(proposal.grand_total),
      },
      items: items.map(i => ({
        ...i,
        qty: Number(i.qty),
        rate: Number(i.rate),
        total: Number(i.total),
      })),
      totals: {
        subtotal: Number(proposal.subtotal),
        totalTax:
          Number(proposal.cgst_total) +
          Number(proposal.sgst_total) +
          Number(proposal.igst_total),
        grandTotal: Number(proposal.grand_total),
      },
    });

  } catch (err) {
    console.error("proposal-by-rfq API error:", err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
