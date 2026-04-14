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
/* ================= FORMAT DATE ================= */

function buildHTML(data) {

  const {
    proposal, sender, computedItems, charges: computedCharges,
    subtotal, cgstTotal, sgstTotal, igstTotal,
    totalTax, grandTotal, formattedDate,isInterState 
  } = data;


/* ================= STATE LOGIC ================= */

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

const clientStateCode = proposal.gstin
  ? proposal.gstin.substring(0, 2)
  : senderStateCode;

  const senderStateCode = sender.gstin
    ? sender.gstin.substring(0, 2)
    : "";

  const clientStateName = stateMap[clientStateCode] || "";
  const senderStateName = stateMap[senderStateCode] || "";
const isSelf = proposal.billing_type === "self";

const companyName = proposal.company || "";

const billingAddress = proposal.billing_address || "";
const shippingAddress = proposal.shipping_address || billingAddress;

const itemRows = computedItems.map((x, i) => {
const sgstRate = isInterState ? 0 : (x.sgst_rate || 0);
const cgstRate = isInterState ? 0 : (x.cgst_rate || 0);
const igstRate = isInterState ? (x.igstRate || 0) : 0;

  return `
<tr>
<td class="tr">${i + 1}</td>
<td class="tdl">${x.description}</td>
<td class="tr">${x.hsn ?? ""}</td>
<td class="tr">${x.qty}</td>
<td class="tr">${x.rate.toFixed(2)}</td>
<td class="tr">${x.discount.toFixed(2)}%</td>
<td class="tr">${x.unitDiscount.toFixed(2)}</td>
<td class="tr">${x.baseAmount.toFixed(2)}</td>

<td class="tr">${sgstRate}</td>
<td class="tr">${x.sgst.toFixed(2)}</td>

<td class="tr">${cgstRate}</td>
<td class="tr">${x.cgst.toFixed(2)}</td>

<td class="tr">${igstRate}</td>
<td class="tr">${x.igst.toFixed(2)}</td>

<td class="tr">${x.total.toFixed(2)}</td>
</tr>`;
}).join("");

const chargeRows = computedCharges.map(c => {
  const sgstRate = c.igst > 0 ? 0 : c.taxPercent / 2;
  const cgstRate = c.igst > 0 ? 0 : c.taxPercent / 2;
  const igstRate = c.igst > 0 ? c.taxPercent : 0;

  return `
<tr>
<td></td>
<td class="tdl">${c.label}</td>
<td></td><td></td><td></td><td></td><td></td>

<td class="tr">${c.amount.toFixed(2)}</td>

<td class="tr">${sgstRate}</td>
<td class="tr">${c.sgst.toFixed(2)}</td>

<td class="tr">${cgstRate}</td>
<td class="tr">${c.cgst.toFixed(2)}</td>

<td class="tr">${igstRate}</td>
<td class="tr">${c.igst.toFixed(2)}</td>

<td class="tr" >${c.total.toFixed(2)}</td>
</tr>`;
}).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>

@page{
  size:A4;
  margin:0;   /* ⭐ KEY */
}

body{
  margin:0;
  padding:10mm;  /* content margin */
  font-family:Segoe UI,Arial,sans-serif;
}


.page{
  width:100%;
  min-height:277mm;   
  display:flex;
  flex-direction:column;
}

/* HEADER */
/* HEADER */
.hdr{
  position:relative;
  display:flex;
  justify-content:flex-end;
  margin-bottom:14px;
  min-height:140px;
  width:100%;
}



/* LEFT MOTIF */
.hdr-motif{
  position:fixed;
  left:0;
  top:0;
  width:150px;
  height:auto;
  z-index:9999;
}



.hdr-right{
  display:flex;
  flex-direction:column;
  align-items:flex-end; /* logo + text right */
  max-width:200px; /* control width */
}

.hdr-right img{
  width:190px;
  height:auto;
  margin-bottom:6px;
   margin-right:15px;
   text-align:left;
}

.hdr-text{
  font-size:10px;
  line-height:15px;
  text-align:left; /* text normal */
  width:100%;
}



/* MAIN BOX */
.box{
  border:1px solid #999;
}

.strip{
  background:#d9c9b0;
  text-align:center;
  font-weight:700;
  font-size:12px;
  padding:4px 0;
  border-bottom:1px solid #F4E0D0;
  letter-spacing:.5px;
}

.sec{
  padding:6px 8px;
  font-size:10px;
  line-height:15px;
  border-bottom:1px dotted #b5b5b5;
}

/* ================= TABLE ================= */

:root{
  --grid:#b7b7b7;
}

td.tr{
  text-align:right !important;
}

td.tdl{
  text-align:left !important;
}
  
table{
  width:100%;
  border-collapse:collapse;   
  font-size:8.5px;
}

/* HEADER + CELL */
th, td{
  padding:3px 3px;
  border-right:1px dotted var(--grid);
  border-bottom:1px dotted var(--grid);
}

/* REMOVE OUTER DOUBLE */
th:last-child,
td:last-child{
  border-right:none;
}

tr:last-child td{
  border-bottom:none;
}

/* HEADER STYLE */
th{
  background:#efefef;
  font-size:8px;
  font-weight:700;
}

/* TOTAL ROW */
.tbold td{
  font-weight:700;
  border-top:1px dotted var(--grid);
}

/* LEFT ALIGN */
.tdl{
  text-align:left;
  padding-left:4px;
}

/* ================= AMOUNT ================= */

.amt-row{
  display:flex;
  border-top:1px dotted #b5b5b5;
}

.amt-words{
  flex:0 0 48%;
  padding:8px;
  font-size:9.5px;
  text-align:center;
  border-right:1px dotted #b5b5b5;
}

.tax-table{
  flex:1;
}

.tax-table table{
  border-collapse:collapse;
}

.tax-table td{
  border:none;
  border-bottom:1px dotted #b5b5b5;
  padding:3px 6px;
  font-size:9.5px;
  text-align:right;
}

.tax-table td:first-child{
  text-align:left;
}

/* ================= BANK ================= */

.bank-row{
  display:grid;
  grid-template-columns:1fr 1fr;
  border-top:1px dotted #b5b5b5;
}

.bank-left{
  padding:8px;
  border-right:1px dotted #b5b5b5;
  font-size:9.5px;
  line-height:15px;
}

.bank-right{
  padding:8px;
  font-size:9.5px;
  text-align:center;
  line-height:15px;
}

/* TERMS */
.terms{
  background:#f2f2f2;
  padding:12px 14px;
  margin-top:12px;
}

.terms h3{
  text-align:center;
  font-size:10.5px;
  margin-bottom:6px;
  font-weight:700;
}

.terms-cols{
  display:grid;
  grid-template-columns:1fr 1fr; /* equal */
  gap:18px;
  font-size:9px;
  line-height:14px;
}

/* FOOTER */
.footer-wrap{
  margin-top:auto;
}

.thankyou{
  text-align:center;
  margin:10px 0 4px 0;
  font-size:16px;
  font-weight:bold;
}

.footer{
  background:#cfd84e;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:15px 12px;   /* reduce height */
  font-size:10px;

  /* ⭐ stretch to paper edge */
  margin-left:-10mm;
  margin-right:-10mm;
  margin-bottom:-10mm;
}

</style>
</head>

<body>
<div class="page">

<!-- HEADER -->
<div class="hdr">

  <!-- LEFT MOTIF -->
<img 
  class="hdr-motif"
  width="140"
  src="https://res.cloudinary.com/dxb1whlam/image/upload/v1771496761/motif_300x400_hahbf7.png"
>


  <!-- RIGHT BLOCK -->
  <div class="hdr-right">
    <img 
      src="https://res.cloudinary.com/dxb1whlam/image/upload/v1771752355/manik_trifaley_logo_white_bgdbsp.png"
    >

  <div class="hdr-text">
  <b>Registered Office</b><br>
  ${sender.address_line1 || ""}<br>
${sender.city || ""}, ${sender.state || ""} - ${sender.pincode || ""}<br>
${sender.email || ""} | ${sender.phone || ""}<br>
${sender.website || ""}
</div>
  </div>

</div>





<div class="box">

<div class="strip">Quotation</div>

<div class="sec">
Quotation No: ${proposal.proposal_number}<br>
Quotation Date: ${formattedDate}<br>
Quotation Validity: One month from quotation date<br>
<b>GSTIN: ${sender.gstin || ""}</b><br>
State: ${senderStateName} | State Code: ${senderStateCode}
</div>

<div class="sec">
Contact Person: ${proposal.client_name}<br>
Contact Number: ${proposal.client_phone}<br>
Company name: ${companyName}<br>
Address: ${billingAddress}<br>
<b>GSTIN: ${isSelf ? "" : (proposal.gstin || "")}</b><br>
State: ${clientStateName} | State Code: ${clientStateCode}</div>

<table>
<thead>
<tr>
<th>S.No</th>
<th>Product Description</th>
<th>HSN</th>
<th>Qty</th>
<th>Cost</th>
<th>Disc</th>
<th>Disc Amt</th>
<th>Amt</th>
<th>SGST</th>
<th>Amt</th>
<th>CGST</th>
<th>Amt</th>
<th>IGST</th>
<th>Amt</th>
<th>Total</th>
</tr>
</thead>
<tbody>
${itemRows}
${chargeRows}
<tr class="tbold">
<td colspan="7">Total</td>
<td class="tr">${subtotal.toFixed(2)}</td>
<td></td><td class="tr">${cgstTotal.toFixed(2)}</td>
<td></td><td class="tr">${sgstTotal.toFixed(2)}</td>
<td></td><td class="tr">${igstTotal.toFixed(2)}</td>
<td class="tr">${grandTotal.toFixed(2)}</td>
</tr>
</tbody>
</table>

<div class="amt-row">

<div class="amt-words">
Total quotation amount in words<br><br>
<b>${numberToWords(grandTotal)}</b>
</div>

<div class="tax-table">
<table>
<tr><td>Total Amount before Tax</td><td>${subtotal.toFixed(2)}</td></tr>
<tr><td>Add: CGST</td><td>${cgstTotal.toFixed(2)}</td></tr>
<tr><td>Add: SGST</td><td>${sgstTotal.toFixed(2)}</td></tr>
<tr><td>Add: IGST</td><td>${igstTotal.toFixed(2)}</td></tr>
<tr><td>Total Tax Amount</td><td>${totalTax.toFixed(2)}</td></tr>
<tr><td>Total Amount after Tax</td><td>${grandTotal.toFixed(2)}</td></tr>
<tr><td>GST on Reverse Charge</td><td>0</td></tr>
</table>
</div>

</div>

<div class="bank-row">

<div class="bank-left">
<b>Bank Details</b><br>
Bank Name: ${sender.bank_name || "-"}<br>
A/C No: ${sender.bank_account || "-"}<br>
IFSC: ${sender.bank_ifsc || "-"}<br>
Branch: ${sender.bank_branch || "-"}<br>
<br>
Interest @24% Per Annum will be charged on overdue bills<br>
Contact: ${sender.phone || ""} | ${sender.email || ""}
</div>


<div class="bank-right">

  <div style="text-align:center; font-weight:600; margin-bottom:15px;">
    For Manik Trifaley Design Studio Pvt Ltd
  </div>

  <div style="text-align:center;">
    <img 
      src="https://res.cloudinary.com/dxb1whlam/image/upload/v1771567348/stamp_wcltx2.jpg"
      style="width:120px; display:block; margin:0 auto 8px auto;"
    />
  </div>

  <div style="text-align:center;">
    Authorised Signatory & Stamp
  </div>

</div>

</div>

</div>

<div class="terms">
<h3>Terms & Conditions</h3>
<div class="terms-cols">
<div>
1. <b>Product Description:</b> As per the approved production sample and/or product specification sheet. Although stringent quality guidelines are maintained, most of our products are handmade; therefore, very minor variations may occur in the final product.<br>

2. <b>Price:</b> The price is inclusive of packaging as approved in the product specification sheet.<br>

3. <b>Delivery Charges:</b> At actuals.<br>

4. <b>Taxes:</b> GST applicable as per government norms.<br>

5. <b>Payment:</b> Being a MSME vendor, payment within 45 days.
</div>

<div>
6. <b>Production Time Frame:</b> As per agreement.<br>

7. <b>Order Confirmation:</b> On receipt of a formal Purchase Order on the company letterhead.<br>

8. <b>Changes in Product Specifications:</b> No changes will be accepted once the Purchase Order is signed and sealed.<br>

9. <b>Force Majeure:</b> This quotation is subject to standard Force Majeure terms and conditions.<br>

10. <b>Jurisdiction:</b> All dealings under this quotation are subject to the jurisdiction of Pune courts.<br>

11. <b>Warranty:</b> No warranty or guarantee is provided on this product.
</div>

</div>
</div>

<div class="footer-wrap">

  <div class="thankyou">
    We look forward to your positive response.
  </div>

  <div class="footer">
    <span>CIN: U47735PN2025PTC244212</span>
    <span>Wonders by Hands</span>
  </div>

</div>

</div>
</body>
</html>`;
}

/* ================= API ================= */
export async function GET(req, { params }) {
  try {
     const { proposalId } = await params;
  const proposalIdNum = Number(proposalId);

  if (!proposalIdNum) {
    return Response.json({ message: "Invalid proposal id" }, { status: 400 });
  }


    /* ================= FETCH DATA ================= */
    const [[proposal]] = await db.query(`
      SELECT 
        p.id,
        p.company_id,
        p.proposal_number,
        p.proposal_date,
        p.billing_address,
        p.shipping_address,
       CASE 
  WHEN r.billing_type = 'self' THEN p.company_name
  ELSE c.company_name
END AS company,
        cb.gstin,
        r.client_name,
        r.client_phone,
          r.billing_type
      FROM proposals p
      JOIN rfqs r ON r.id = p.rfq_id
      JOIN companies c ON c.id = r.company_id
      JOIN company_branches cb ON cb.id = r.branch_id
      WHERE p.id = ?
    `, [proposalIdNum]);

    if (!proposal)
      return Response.json({ message: "Proposal not found" }, { status: 404 });

    const formattedDate = new Date(proposal.proposal_date)
  .toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
    const [[sender]] = await db.query(`SELECT * FROM company_info LIMIT 1`);

    /* ================= STATE LOGIC ================= */
    const clientStateCode = proposal.gstin?.substring(0, 2) || "";
    const senderStateCode = sender.gstin?.substring(0, 2) || "";
    const isInterState = clientStateCode !== senderStateCode;

    /* ================= ITEMS ================= */
    const [items] = await db.query(`
      SELECT 
        pi.quantity qty,
        pi.rate,
        pi.discount,
      pr.cgst_rate,
pr.sgst_rate,
pr.igst_rate,
 CASE 
      WHEN cpp.prefix IS NOT NULL AND cpp.prefix != ''
      THEN CONCAT(cpp.prefix, ' | ', pr.product_name)
      ELSE pr.product_name
    END AS description,
        pr.hsn
      FROM proposal_items pi
      JOIN products pr ON pr.id = pi.product_id

  LEFT JOIN company_product_pricing cpp
    ON cpp.product_id = pr.id
    AND cpp.company_id = ?

      WHERE pi.proposal_id = ?
      ORDER BY pi.id
    `, [proposal.company_id, proposal.id]);

    /* ================= CHARGES ================= */
    const [companyCharges] = await db.query(`
      SELECT label,amount,tax_percent taxPercent
      FROM company_charges
      WHERE company_id=?
    `, [proposal.company_id]);

    const [proposalCharges] = await db.query(`
      SELECT label,amount,tax_percent taxPercent
      FROM proposal_charges
      WHERE proposal_id=?
    `, [proposal.id]);

    const allCharges = proposalCharges.length ? proposalCharges : companyCharges;

    /* ================= CALCULATE ITEMS ================= */
    let itemSubtotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

const computedItems = items.map(i => {
  const qty = +i.qty || 0;
  const rate = +i.rate || 0;
  const disc = +i.discount || 0;
const baseAmount = qty * rate;
const taxable = baseAmount; 
  let cg = 0, sg = 0, ig = 0;
const unitDiscount = disc
  ? (rate / (1 - disc / 100)) - rate
  : 0;
    const cgstRate = +i.cgst_rate || 0;
const sgstRate = +i.sgst_rate || 0;
const igstRate = +i.igst_rate || (cgstRate + sgstRate);

if (isInterState) {
  ig = taxable * igstRate / 100;
} else {
  cg = taxable * cgstRate / 100;
  sg = taxable * sgstRate / 100;
}

  itemSubtotal += taxable;
  cgstTotal += cg;
  sgstTotal += sg;
  igstTotal += ig;

  return {
    ...i,
    qty,
    rate,
    discount: disc,
    amount: taxable,
    baseAmount,
    unitDiscount,
    cgst: cg,
    sgst: sg,
    igst: ig,
    igstRate,   // ⭐ ADD
    total: taxable + cg + sg + ig
  };
});
    /* ================= CALCULATE CHARGES ================= */
    let chargeSubtotal = 0;

    const computedCharges = allCharges.map(c => {
  const amt = +c.amount || 0;
  const taxRate = +c.taxPercent || 0;

  let cg = 0, sg = 0, ig = 0;

  if (isInterState) {
    ig = amt * taxRate / 100;
  } else {
    cg = amt * (taxRate / 2) / 100;
    sg = amt * (taxRate / 2) / 100;
  }

  chargeSubtotal += amt;
  cgstTotal += cg;
  sgstTotal += sg;
  igstTotal += ig;

  return {
    label: c.label,
    amount: amt,
     taxPercent: taxRate, 
    cgst: cg,
    sgst: sg,
    igst: ig,
    total: amt + cg + sg + ig
  };
});

    const subtotal = itemSubtotal + chargeSubtotal;
    const totalTax = cgstTotal + sgstTotal + igstTotal;
    const grandTotal = subtotal + totalTax;

    /* ================= TABLE ROWS ================= */
    const itemRows = computedItems.map((x, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${x.description}</td>
        <td>${x.hsn }</td>
        <td>${x.qty}</td>
        <td>${x.rate.toFixed(2)}</td>
       <td >${x.unitDiscount.toFixed(2)}</td>
        <td>${x.amount.toFixed(2)}</td>
        <td>${x.cgst.toFixed(2)}</td>
        <td>${x.sgst.toFixed(2)}</td>
        <td>${x.igst.toFixed(2)}</td>
        <td>${x.total.toFixed(2)}</td>
      </tr>
    `).join("");

    const chargeRows = computedCharges.map(c => `
      <tr>
        <td></td>
        <td>${c.label}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>${c.amount.toFixed(2)}</td>
        <td>${c.cgst.toFixed(2)}</td>
        <td>${c.sgst.toFixed(2)}</td>
        <td>${c.igst.toFixed(2)}</td>
        <td>${c.total.toFixed(2)}</td>
      </tr>
    `).join("");

    /* ================= HTML ================= */
     const html = buildHTML({
      proposal,
      sender,
      computedItems,
      charges: computedCharges,
      subtotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalTax,
      grandTotal,
      formattedDate,
       isInterState 
    });

    /* ================= PDFSHIFT ================= */
    const pdfRes = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from("api:" + process.env.PDFSHIFT_API_KEY).toString("base64"),
      },
      body: JSON.stringify({
        source: html,
        format: "A4",
        use_print: true,
      }),
    });

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${proposal.proposal_number}.pdf"`,
      },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ message: "PDF error" }, { status: 500 });
  }
}












