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
        p.company_id,
        r.rfq_number,
        r.client_name,
        r.client_phone,
        r.client_email,
        p.proposal_number,
        p.proposal_date,
        p.billing_address,
        p.shipping_address,
        p.place,
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
    const [dbItems] = await db.query(
      `
      SELECT
        pr.product_name AS description,
        pr.sku AS product_code,
        pr.hsn,
        pr.featured_image,
        pi.quantity AS qty,
        pi.rate
      FROM proposal_items pi
      JOIN products pr ON pr.id = pi.product_id
      WHERE pi.proposal_id = ?
      ORDER BY pi.id ASC
      `,
      [proposal.id]
    );

    /* ================= CALCULATE ITEMS ================= */
    let itemsSubtotal = 0;
    let itemsTax = 0;

    const items = dbItems.map(i => {
      const qty = Number(i.qty || 0);
      const rate = Number(i.rate || 0);

      const taxable = qty * rate;

      // assume intra-state 18% GST split
      const cgst = taxable * 0.09;
      const sgst = taxable * 0.09;

      const total = taxable + cgst + sgst;

      itemsSubtotal += taxable;
      itemsTax += cgst + sgst;

      return {
        ...i,
        qty,
        rate,
        total
      };
    });

    /* ================= CHARGES ================= */
    let [charges] = await db.query(
      `
      SELECT label, amount, tax_percent AS taxPercent
      FROM proposal_charges
      WHERE proposal_id = ?
      ORDER BY id ASC
      `,
      [proposal.id]
    );

    if (!charges.length) {
      [charges] = await db.query(
        `
        SELECT label, amount, tax_percent AS taxPercent
        FROM company_charges
        WHERE company_id = ?
        ORDER BY id ASC
        `,
        [proposal.company_id]
      );
    }

    let chargesAmount = 0;
    let chargesTax = 0;

    const computedCharges = charges.map(c => {
      const amt = Number(c.amount || 0);
      const taxPercent = Number(c.taxPercent || 0);
      const tax = (amt * taxPercent) / 100;

      chargesAmount += amt;
      chargesTax += tax;

      return {
        label: c.label,
        amount: amt,
        taxPercent
      };
    });

    /* ================= TOTALS ================= */
    const grandTotal =
      itemsSubtotal +
      itemsTax +
      chargesAmount +
      chargesTax;

    /* ================= RESPONSE ================= */
    return Response.json({
      proposal: {
        ...proposal,
        clientName: proposal.client_name || "",
        clientPhone: proposal.client_phone || "",
        clientEmail: proposal.client_email || "",
      },

      items,

      charges: computedCharges,

      totals: {
        subtotal: itemsSubtotal,
        itemTax: itemsTax,
        chargesAmount,
        chargesTax,
        grandTotal
      }
    });

  } catch (err) {
    console.error("proposal-by-rfq API error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
