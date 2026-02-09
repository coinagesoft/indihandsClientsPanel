export const runtime = "nodejs";
import { db } from "../../../../db";
import { verifyToken } from "../../../../lib/auth";

export async function GET(req, { params }) {
  try {
    const { rfqId } = await params;
    const rfq_id = Number(rfqId);

    let decoded;
    try {
      decoded = verifyToken(req);
    } catch {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = decoded;

    if (!rfq_id) {
      return Response.json({ proposal: null });
    }

    /* ================= PROPOSAL ================= */
    const [[proposal]] = await db.query(
      `
      SELECT
        p.id,
        p.rfq_id,
        r.rfq_number,
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
      JOIN rfqs r ON r.id = p.rfq_id
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
        pr.product_name AS description,
        pr.sku AS product_code,
        pr.hsn,
        pr.featured_image,
        pi.quantity AS qty,
        pi.rate,
        pi.line_total AS total
      FROM proposal_items pi
      JOIN products pr ON pr.id = pi.product_id
      WHERE pi.proposal_id = ?
      ORDER BY pi.id ASC
      `,
      [proposal.id]
    );

    /* ================= CHARGES ================= */
    const [charges] = await db.query(
      `
      SELECT
        label,
        amount,
        tax_percent AS taxPercent
      FROM proposal_charges
      WHERE proposal_id = ?
      ORDER BY id ASC
      `,
      [proposal.id]
    );

    let chargesAmount = 0;
    let chargesTax = 0;

    charges.forEach(c => {
      const amt = Number(c.amount || 0);
      const tax = (amt * Number(c.taxPercent || 0)) / 100;
      chargesAmount += amt;
      chargesTax += tax;
    });

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

      charges: charges.map(c => ({
        label: c.label,
        amount: Number(c.amount),
        taxPercent: Number(c.taxPercent || 0),
      })),

      totals: {
        subtotal: Number(proposal.subtotal),
        itemTax:
          Number(proposal.cgst_total) +
          Number(proposal.sgst_total) +
          Number(proposal.igst_total),

        chargesAmount,
        chargesTax,

        grandTotal:
          Number(proposal.subtotal) +
          Number(proposal.cgst_total) +
          Number(proposal.sgst_total) +
          Number(proposal.igst_total) +
          chargesAmount +
          chargesTax,
      },
    });

  } catch (err) {
    console.error("proposal-by-rfq API error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
