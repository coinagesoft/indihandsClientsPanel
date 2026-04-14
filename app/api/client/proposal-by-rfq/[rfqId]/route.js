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
        r.billing_type,
        p.proposal_number,
        p.proposal_date,
        p.billing_address,
        p.shipping_address,
        p.place,
        p.status,
         cb.gstin
      FROM proposals p
      JOIN rfqs r ON r.id = p.rfq_id

        JOIN company_branches cb ON cb.id = r.branch_id 
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
         CASE 
      WHEN cpp.prefix IS NOT NULL AND cpp.prefix != ''
      THEN CONCAT(cpp.prefix, ' | ', pr.product_name)
      ELSE pr.product_name
    END AS description,
        pr.sku AS product_code,
        pr.hsn,
        pr.featured_image,
        pi.quantity AS qty,
        pi.rate,
   pr.cgst_rate,
  pr.sgst_rate,
  pr.igst_rate
      FROM proposal_items pi
      JOIN products pr ON pr.id = pi.product_id

        LEFT JOIN company_product_pricing cpp
    ON cpp.product_id = pr.id
    AND cpp.company_id = ?

      WHERE pi.proposal_id = ?
      ORDER BY pi.id ASC
      `,
      [companyId, proposal.id]   
    );

/* ================= GST STATE LOGIC ================= */

    const clientStateCode = proposal.gstin?.substring(0, 2) || "";

    const [[companyRow]] = await db.query(
      `
      SELECT gstin 
      FROM company_branches 
      WHERE company_id = ?
      ORDER BY id ASC
      LIMIT 1
      `,
      [companyId]
    );

    const senderStateCode = companyRow?.gstin?.substring(0, 2) || "";

    const isInterState = senderStateCode !== clientStateCode;

    /* ================= CALCULATE ITEMS ================= */
let itemsSubtotal = 0;
let itemsTax = 0;

const items = dbItems.map(i => {
  const qty = Number(i.qty || 0);
  const rate = Number(i.rate || 0);

  const taxable = qty * rate;

  const cgstRate = Number(i.cgst_rate || 0);
  const sgstRate = Number(i.sgst_rate || 0);
  const igstRate = Number(i.igst_rate || 0);

   // ✅ STATE BASED GST
      const cgst = isInterState ? 0 : (taxable * cgstRate) / 100;
      const sgst = isInterState ? 0 : (taxable * sgstRate) / 100;
      const igst = isInterState ? (taxable * igstRate) / 100 : 0;

  const total = taxable + cgst + sgst + igst;

  itemsSubtotal += taxable;
  itemsTax += cgst + sgst + igst;

  return {
    ...i,
    qty,
    rate,
    cgst,
    sgst,
    igst,
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
        gstin: proposal.billing_type === "self" ? "" : (proposal.gstin || ""),

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
