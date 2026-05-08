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

    const { companyId,  customerId,userType, } = decoded;

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

  p.customer_id,

  p.proposal_type,

  r.rfq_number,

  r.rfq_type,

  r.client_name,

  r.client_phone,

  r.client_email,

  r.billing_type,

  p.proposal_number,

  p.proposal_date,

  p.billing_address,

  p.shipping_address,
  p.payment_status,
p.invoice_id,

  p.place,

  p.status,

  cb.gstin,

  cb.sez_type

FROM proposals p

JOIN rfqs r
  ON r.id = p.rfq_id

LEFT JOIN company_branches cb
  ON cb.id = r.branch_id

WHERE p.rfq_id = ?

AND (

  (
    ? = 'B2B'
    AND p.company_id = ?
  )

  OR

  (
    ? = 'B2C'
    AND p.customer_id = ?
  )

)

LIMIT 1
      `,
    [
  rfq_id,

  userType,
  companyId || 0,

  userType,
  customerId || 0,
]
    );

    if (!proposal) {
      return Response.json({ proposal: null });
    }

    /* ================= STATE + SEZ ================= */
const clientStateCode =

  proposal?.gstin
    ?.substring(0, 2) || "";

  let senderStateCode = "";

if (userType === "B2B") {

  const [[companyRow]] =
    await db.query(
      `
      SELECT gstin

      FROM company_branches

      WHERE company_id = ?

      LIMIT 1
      `,
      [companyId]
    );

  senderStateCode =
    companyRow?.gstin
      ?.substring(0, 2) || "";
}


    const isInterState = senderStateCode !== clientStateCode;
    const isSEZ = (proposal.sez_type || "").toUpperCase() === "SEZ";  // ✅ ADD

    /* ================= ITEMS ================= */
    const [dbItems] = await db.query(
      `
      SELECT
   CASE

  WHEN ? = 'B2B'
   AND cpp.prefix IS NOT NULL
   AND cpp.prefix != ''

  THEN CONCAT(
    cpp.prefix,
    ' | ',
    pr.product_name
  )

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

LEFT JOIN customer_product_pricing custp
  ON custp.product_id = pr.id


      WHERE pi.proposal_id = ?
      ORDER BY pi.id ASC
      `,
[
  userType,

  companyId || 0,

  proposal.id
]
    );

    let itemsSubtotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const items = dbItems.map(i => {
      const qty = Number(i.qty || 0);
      const rate = Number(i.rate || 0);
      const taxable = qty * rate;

      const cgstRate = Number(i.cgst_rate || 0);
      const sgstRate = Number(i.sgst_rate || 0);
      const igstRate =
        Number(i.igst_rate || 0) ||
        (cgstRate + sgstRate);

      let cgst = 0, sgst = 0, igst = 0;

      if (isSEZ || isInterState) {
        igst = (taxable * igstRate) / 100;
      } else {
        cgst = (taxable * cgstRate) / 100;
        sgst = (taxable * sgstRate) / 100;
      }

      itemsSubtotal += taxable;
      cgstTotal += cgst;
      sgstTotal += sgst;
      igstTotal += igst;

      return {
        ...i,
        qty,
        rate,
        cgst,
        sgst,
        igst,
        total: taxable + cgst + sgst + igst
      };
    });

    /* ================= CHARGES ================= */
    let [charges] = await db.query(
      `
      SELECT label, amount, tax_percent AS taxPercent
      FROM proposal_charges
      WHERE proposal_id = ?
      `,
      [proposal.id]
    );

    if (!charges.length) {
      [charges] = await db.query(
        `
        SELECT label, amount, tax_percent AS taxPercent
        FROM company_charges
        WHERE company_id = ?
        `,
        [proposal.company_id]
      );
    }

    let chargesAmount = 0;

    const computedCharges = charges.map(c => {
      const amt = Number(c.amount || 0);
      const taxPercent = Number(c.taxPercent || 0);

      let cgst = 0, sgst = 0, igst = 0;

      if (isSEZ || isInterState) {
        igst = (amt * taxPercent) / 100;
      } else {
        cgst = (amt * (taxPercent / 2)) / 100;
        sgst = (amt * (taxPercent / 2)) / 100;
      }

      chargesAmount += amt;

      cgstTotal += cgst;
      sgstTotal += sgst;
      igstTotal += igst;

      return {
        label: c.label,
        amount: amt,
        taxPercent,
        cgst,
        sgst,
        igst,
        total: amt + cgst + sgst + igst
      };
    });

    const subtotal = itemsSubtotal + chargesAmount;
    const totalTax = cgstTotal + sgstTotal + igstTotal;
    const grandTotal = subtotal + totalTax;

    return Response.json({
      proposal: {
        ...proposal,
        gstin: proposal.billing_type === "self" ? "" : (proposal.gstin || ""),
      },
      items,
      charges: computedCharges,
      totals: {
        subtotal,
        cgstTotal,
        sgstTotal,
        igstTotal,
        totalTax,
        grandTotal
      }
    });

  } catch (err) {
    console.error("proposal-by-rfq API error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
