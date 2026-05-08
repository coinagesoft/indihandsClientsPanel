export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { db } from "../../../../db";

/* ================= NUMBER TO WORDS ================= */
function numberToWords(num) {
  if (!num) return "Zero Only";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = n => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + " Crore " + inWords(n % 10000000);
  };
  return inWords(Math.round(num)) + " Only";
}

function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}-${m}-${y}`;
}

/* ================= HTML TEMPLATE (B2C only) ================= */
function buildHTML({ invoice, payment, proposal, sender,  customerGSTIN,
  clientState,
  clientStateCode,computedItems, computedCharges,
  subtotal, cgstTotal, sgstTotal, igstTotal, grandTotal, totalTax }) {

  const itemRows = computedItems.map((x, i) => `
<tr>
  <td>${i + 1}</td>
  <td class="left">${x.description || ""}</td>
  <td>${x.hsn || ""}</td>
  <td>${x.qty}</td>
  <td>${x.rate.toFixed(2)}</td>
  <td>${x.amount.toFixed(2)}</td>
  <td>${x.amount.toFixed(2)}</td>
  <td>${x.isIGST ? "0" : (x.cgst_rate || 0)}</td>
  <td>${x.isIGST ? "0.00" : x.cgst.toFixed(2)}</td>
  <td>${x.isIGST ? "0" : (x.sgst_rate || 0)}</td>
  <td>${x.isIGST ? "0.00" : x.sgst.toFixed(2)}</td>
  <td>${x.isIGST ? (x.igstRate || 0) : "0"}</td>
  <td>${x.isIGST ? x.igst.toFixed(2) : "0.00"}</td>
  <td>${x.total.toFixed(2)}</td>
</tr>`).join("");

  const chargeRows = computedCharges.map(c => `
<tr>
  <td></td>
  <td class="left">${c.label}</td>
  <td>${c.hsnCode || ""}</td>
  <td></td><td></td>
  <td>${c.amount.toFixed(2)}</td>
  <td>${c.amount.toFixed(2)}</td>
  <td>${(!c.isIGST && c.cgst > 0) ? (c.taxPercent / 2).toFixed(2) : "0"}</td>
  <td>${c.isIGST ? "0.00" : c.cgst.toFixed(2)}</td>
  <td>${(!c.isIGST && c.sgst > 0) ? (c.taxPercent / 2).toFixed(2) : "0"}</td>
  <td>${c.isIGST ? "0.00" : c.sgst.toFixed(2)}</td>
  <td>${(c.isIGST && c.igst > 0) ? c.taxPercent.toFixed(2) : "0"}</td>
  <td>${c.isIGST ? c.igst.toFixed(2) : "0.00"}</td>
  <td>${c.total.toFixed(2)}</td>
</tr>`).join("");

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
@page { size: A4; margin: 0; }
body { margin: 0; padding: 10mm; font-family: Segoe UI, Arial, sans-serif; }
.page { width: 100%; min-height: 277mm; display: flex; flex-direction: column; }
.hdr { display: flex; justify-content: flex-end; margin-bottom: 14px; min-height: 100px; }
.hdr img { width: 190px; height: 60px; object-fit: contain; }
.box { border: 1px solid #8c8c8c; }
.strip { background: #f2f2f2; text-align: center; font-weight: 700; font-size: 12px; padding: 5px 0; border-bottom: 1px solid #8c8c8c; }
.copy-row { text-align: right; font-size: 10px; font-weight: 600; padding: 4px 8px; font-style: italic; border-bottom: 1px solid #8c8c8c; }
.meta { width: 100%; border-collapse: collapse; font-size: 10px; }
.meta td { border-bottom: 1px dotted #b7b7b7; padding: 4px 6px; }
.meta td.label { width: 160px; font-weight: 600; }
.meta td.value { width: 260px; }
.party { width: 100%; border-collapse: collapse; font-size: 10px; }
.party td { border-top: 1px dotted #b7b7b7; padding: 6px; vertical-align: top; }
.party .title { font-weight: 700; margin-bottom: 2px; }
.items { width: 100%; border-collapse: collapse; font-size: 8.5px; }
.items th, .items td { border-right: 1px dotted #b7b7b7; border-bottom: 1px dotted #b7b7b7; padding: 3px 4px; }
.items th:last-child, .items td:last-child { border-right: none; }
.items th { background: #efefef; font-weight: 700; }
.items td { text-align: center; }
.items td.left { text-align: left; }
.items tr.total td { font-weight: 700; }
.amt { display: grid; grid-template-columns: 1fr 300px; border-top: 1px dotted #b7b7b7; }
.amt-words { padding: 8px; font-size: 9.5px; text-align: center; border-right: 1px dotted #b5b5b5; }
.totals table { width: 100%; border-collapse: collapse; font-size: 10px; }
.totals td { border-bottom: 1px dotted #b7b7b7; padding: 4px 6px; text-align: right; }
.totals td:first-child { text-align: left; }
.bank { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px dotted #b7b7b7; }
.bank-left { padding: 8px; border-right: 1px dotted #b7b7b7; font-size: 10px; line-height: 16px; }
.bank-right { padding: 8px; text-align: center; font-size: 10px; position: relative; min-height: 80px; }
</style>
</head>
<body>
<div class="page">

  <div class="hdr">
    ${sender.logo ? `<img src="${sender.logo}">` : `<div style="height:60px;"></div>`}
  </div>

  <div class="box">
    <div class="strip">Tax Invoice</div>

    <table class="meta">
      <tr>
        <td class="label">Invoice No:</td>
        <td class="value">${invoice.invoice_number}</td>
        <td class="label">Contact Person:</td>
        <td class="value">${payment.payer_name || ""}</td>
      </tr>
      <tr>
        <td class="label">Invoice Date:</td>
        <td class="value">${formatDate(invoice.invoice_date)}</td>
        <td class="label">Contact Number:</td>
        <td class="value">${payment.payer_phone || ""}</td>
      </tr>
      <tr>
        <td class="label">Seller GSTIN:</td>
        <td class="value">${sender.gstin || ""}</td>
        <td class="label">Payment ID:</td>
        <td class="value">${payment.razorpay_payment_id || ""}</td>
      </tr>
    </table>

  <table class="party">
  <tr>
    <td style="width:50%;">
      <div class="title">Bill to Party</div>

      Name: ${payment.payer_name || ""}<br>
      Address: ${proposal.billing_address || payment.billing_address || ""}<br>
      GSTIN: ${customerGSTIN || "-"}<br>
      State: ${clientState} | Code: ${clientStateCode}<br>
  
    </td>

    <td style="width:50%;">
      <div class="title">Ship to Party</div>

      Name: ${payment.payer_name || ""}<br>
      Address: ${proposal.shipping_address || payment.billing_address || ""}<br>
      GSTIN: ${customerGSTIN || "-"}<br>
      State: ${clientState} | Code: ${clientStateCode}<br>
     
    </td>
  </tr>
</table>

    <table class="items">
      <thead>
        <tr>
          <th>S.No</th>
          <th class="left">Product Description</th>
          <th>HSN</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Amount</th>
          <th>Taxable</th>
          <th>CGST%</th>
          <th>CGST Amt</th>
          <th>SGST%</th>
          <th>SGST Amt</th>
          <th>IGST%</th>
          <th>IGST Amt</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        ${chargeRows}
        <tr class="total">
          <td colspan="5">Total</td>
          <td>${subtotal.toFixed(2)}</td>
          <td>${subtotal.toFixed(2)}</td>
          <td></td><td>${cgstTotal.toFixed(2)}</td>
          <td></td><td>${sgstTotal.toFixed(2)}</td>
          <td></td><td>${igstTotal.toFixed(2)}</td>
          <td>${grandTotal.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="amt">
      <div class="amt-words">
        Total invoice amount in words<br><br>
        <b>${numberToWords(grandTotal)}</b>
      </div>
      <div class="totals">
        <table>
          <tr><td>Total Amount before Tax</td><td>${subtotal.toFixed(2)}</td></tr>
          <tr><td>Add CGST</td><td>${cgstTotal.toFixed(2)}</td></tr>
          <tr><td>Add SGST</td><td>${sgstTotal.toFixed(2)}</td></tr>
          <tr><td>Add IGST</td><td>${igstTotal.toFixed(2)}</td></tr>
          <tr><td>Total Tax</td><td>${totalTax.toFixed(2)}</td></tr>
          <tr><td><b>Total after Tax</b></td><td><b>${grandTotal.toFixed(2)}</b></td></tr>
        </table>
      </div>
    </div>

    <div class="bank">
      <div class="bank-left">
        <b>Bank Details</b><br>
        Bank Name: ${sender.bank_name || "-"}<br>
        A/C No: ${sender.bank_account || "-"}<br>
        IFSC: ${sender.bank_ifsc || "-"}<br>
        Branch: ${sender.bank_branch || "-"}<br><br>
        Contact: ${sender.phone || ""} | ${sender.email || ""}
      </div>
      <div class="bank-right">
        <div style="font-weight:600;">For Manik Trifaley Design Studio Pvt Ltd</div>
        <div style="position:absolute; bottom:10px; width:100%; text-align:center;">
          Authorised Signatory &amp; Stamp
        </div>
      </div>
    </div>
  </div>

  <div style="text-align:center; font-size:10px; margin-top:6px;">
    This is a computer-generated invoice.
  </div>
</div>
</body>
</html>`;
}

/* ================= GET HANDLER ================= */
export async function GET(req, { params }) {
  try {
    const { invoiceId } = await params;
    const id = Number(invoiceId);

    /* ── 1. FETCH INVOICE ── */
    const [[invoice]] = await db.query(`
      SELECT
        id, invoice_number, invoice_for,
        DATE_FORMAT(invoice_date, '%Y-%m-%d') AS invoice_date,
        proposal_id, customer_id,
        seller_gstin,buyer_gstin, seller_state_code
      FROM invoices
      WHERE id = ? AND invoice_for = 'B2C'
      LIMIT 1
    `, [id]);

    if (!invoice)
      return Response.json({ message: "B2C Invoice not found" }, { status: 404 });

    /* ── 2. FETCH PAYMENT ── */
    const [[payment]] = await db.query(`
     SELECT
  payer_name,
  payer_phone,
  payer_email,
  billing_address,
  razorpay_payment_id,
  proposal_id,
  customer_id
FROM proposal_payments
      WHERE proposal_id = ? AND payment_status = 'Paid'
      ORDER BY id DESC
      LIMIT 1
    `, [invoice.proposal_id]);

    if (!payment)
      return Response.json({ message: "Payment record not found" }, { status: 404 });

    /* ── 3. FETCH PROPOSAL ── */
const [[proposal]] = await db.query(`
  SELECT
    p.id,
    p.company_id,
    r.shipping_address,
    r.billing_address
  FROM proposals p
  JOIN rfqs r ON r.id = p.rfq_id
  WHERE p.id = ?
  LIMIT 1
`, [invoice.proposal_id]);

    if (!proposal)
      return Response.json({ message: "Proposal not found" }, { status: 404 });
const customerGSTIN =
  invoice.buyer_gstin || "";

  const stateMap = {
  "01":"Jammu and Kashmir",
  "02":"Himachal Pradesh",
  "03":"Punjab",
  "04":"Chandigarh",
  "05":"Uttarakhand",
  "06":"Haryana",
  "07":"Delhi",
  "08":"Rajasthan",
  "09":"Uttar Pradesh",
  "10":"Bihar",
  "11":"Sikkim",
  "12":"Arunachal Pradesh",
  "13":"Nagaland",
  "14":"Manipur",
  "15":"Mizoram",
  "16":"Tripura",
  "17":"Meghalaya",
  "18":"Assam",
  "19":"West Bengal",
  "20":"Jharkhand",
  "21":"Odisha",
  "22":"Chhattisgarh",
  "23":"Madhya Pradesh",
  "24":"Gujarat",
  "25":"Daman and Diu",
  "26":"Dadra and Nagar Haveli",
  "27":"Maharashtra",
  "28":"Andhra Pradesh",
  "29":"Karnataka",
  "30":"Goa",
  "31":"Lakshadweep",
  "32":"Kerala",
  "33":"Tamil Nadu",
  "34":"Puducherry",
  "35":"Andaman and Nicobar Islands",
  "36":"Telangana",
  "37":"Andhra Pradesh (New)",
  "38":"Ladakh"
};


    /* ── 4. FETCH SENDER ── */
    const [[sender]] = await db.query(`SELECT * FROM company_info LIMIT 1`);

const clientStateCode = customerGSTIN
  ? customerGSTIN.substring(0, 2)
  : "27";



const senderStateCode = sender.gstin
  ? sender.gstin.substring(0, 2)
  : "27";

const clientState =
  stateMap[clientStateCode] || "Maharashtra";

    /* ── 5. TAX LOGIC
       B2C is always intra-state (CGST+SGST) unless seller_state_code
       differs from a known customer state — but since B2C customers
       have no GSTIN we default to intra-state (same state as seller)
    ── */
    const isIGST = false; // B2C always CGST+SGST

    /* ── 6. FETCH ITEMS ── */
    const [items] = await db.query(`
      SELECT
        pi.quantity AS qty,
        pi.rate,
        pi.cgst_rate,
        pi.sgst_rate,
        pi.igst_rate,
        pr.product_name AS description,
        pr.hsn
      FROM proposal_items pi
      JOIN products pr ON pr.id = pi.product_id
      WHERE pi.proposal_id = ?
      ORDER BY pi.id
    `, [proposal.id]);

    /* ── 7. FETCH CHARGES ── */
    const [proposalCharges] = await db.query(`
      SELECT label, amount, tax_percent AS taxPercent, hsn_code AS hsnCode
      FROM proposal_charges
      WHERE proposal_id = ?
    `, [proposal.id]);

    const [companyCharges] = await db.query(`
      SELECT label, amount, tax_percent AS taxPercent, '' AS hsnCode
      FROM company_charges
      WHERE company_id = ?
    `, [proposal.company_id]);

    const allCharges = proposalCharges.length ? proposalCharges : companyCharges;

    /* ── 8. CALCULATE ── */
    let cgstTotal = 0, sgstTotal = 0, igstTotal = 0;

    const computedItems = items.map(i => {
      const qty      = +i.qty  || 0;
      const rate     = +i.rate || 0;
      const taxable  = qty * rate;
      const igstRate = (+i.igst_rate || 0) || ((+i.cgst_rate || 0) + (+i.sgst_rate || 0));
      let cg = 0, sg = 0, ig = 0;

      if (isIGST) {
        ig = taxable * igstRate / 100;
      } else {
        cg = taxable * (+i.cgst_rate || 0) / 100;
        sg = taxable * (+i.sgst_rate || 0) / 100;
      }
      cgstTotal += cg; sgstTotal += sg; igstTotal += ig;

      return { ...i, qty, rate, amount: taxable, cgst: cg, sgst: sg, igst: ig, igstRate, isIGST, total: taxable + cg + sg + ig };
    });

    const computedCharges = allCharges.map(c => {
      const amt     = +c.amount     || 0;
      const taxRate = +c.taxPercent || 0;
      let cg = 0, sg = 0, ig = 0;

      if (isIGST) {
        ig = amt * taxRate / 100;
      } else {
        cg = amt * (taxRate / 2) / 100;
        sg = amt * (taxRate / 2) / 100;
      }
      cgstTotal += cg; sgstTotal += sg; igstTotal += ig;

      return { label: c.label, hsnCode: c.hsnCode || "", amount: amt, taxPercent: taxRate, cgst: cg, sgst: sg, igst: ig, isIGST, total: amt + cg + sg + ig };
    });

    /* ── 9. TOTALS ── */
    let subtotal = 0;
    computedItems.forEach(i  => { subtotal += i.amount; });
    computedCharges.forEach(c => { subtotal += c.amount; });

    const totalTax   = cgstTotal + sgstTotal + igstTotal;
    const grandTotal = subtotal + totalTax;

    /* ── 10. STORE TOTALS + customer_id IN DB ── */
    await db.query(`
      UPDATE invoices SET
        customer_id        = ?,
        subtotal           = ?,
        cgst_total         = ?,
        sgst_total         = ?,
        igst_total         = ?,
        grand_total        = ?,
        status             = 'Issued',
        issued_at          = NOW(),
        download_count     = download_count + 1
      WHERE id = ?
    `, [
      payment.customer_id,
      subtotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      grandTotal,
      id,
    ]);

    /* ── 11. RENDER HTML ── */
    const html = buildHTML({
      invoice, payment, proposal, sender,  customerGSTIN,
  clientState,
  clientStateCode,
      computedItems, computedCharges,
      subtotal, cgstTotal, sgstTotal, igstTotal,
      grandTotal, totalTax,
    });

    /* ── 12. GENERATE PDF ── */
    const pdfRes = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from("api:" + process.env.PDFSHIFT_API_KEY).toString("base64"),
      },
      body: JSON.stringify({ source: html, format: "A4", use_print: true }),
    });

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
    const invoiceNo = invoice.invoice_number || `CUS-INV-${invoice.id}`;

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${invoiceNo}.pdf"`,
      },
    });

  } catch (e) {
    console.error(e);
    return Response.json({ message: "PDF generation error" }, { status: 500 });
  }
}