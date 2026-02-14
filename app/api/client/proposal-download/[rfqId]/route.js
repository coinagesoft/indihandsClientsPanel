import PDFDocument from "pdfkit";
import { db } from "../../../../db";
import fs from "fs";
import path from "path";

export async function GET(req, { params }) {
  try {
    const { rfqId } = await params;
    const rfqid = Number(rfqId);

    if (!rfqId || isNaN(rfqid)) {
      return Response.json({ message: "Invalid rfqId" }, { status: 400 });
    }

    // Fetch proposal
    const [[proposal]] = await db.query(
      `SELECT 
        p.id, p.rfq_id,  p.company_id,  p.proposal_number, p.proposal_date,
        p.billing_address, p.shipping_address, p.place,
        c.company_name AS company,
        cb.contact_person AS customerName,
        cb.gstin,
          r.client_name,
  r.client_phone,
  r.client_email
      FROM proposals p
      JOIN rfqs r ON r.id = p.rfq_id
      JOIN companies c ON c.id = r.company_id
      JOIN company_branches cb ON cb.id = r.branch_id
      WHERE p.rfq_id = ?
      LIMIT 1`,
      [rfqId]
    );

    if (!proposal) {
      return Response.json({ message: "Proposal not found for this RFQ" }, { status: 404 });
    }
/* ✅ normalize client fields */
proposal.clientName = proposal.client_name || "";
proposal.clientPhone = proposal.client_phone || "";
proposal.clientEmail = proposal.client_email || "";
    
    // Fetch items
    const [items] = await db.query(
      `SELECT 
        pi.quantity AS qty, pi.rate, pi.discount,
        pi.cgst_rate AS cgst, pi.sgst_rate AS sgst, pi.igst_rate AS igst,
        pr.product_name AS description, pr.hsn
      FROM proposal_items pi
      JOIN products pr ON pr.id = pi.product_id
      WHERE pi.proposal_id = ?
      ORDER BY pi.id ASC`,
      [proposal.id]
    );

    // Fetch additional charges
// Fetch company charges
const [charges] = await db.query(
  `
  SELECT label, amount, tax_percent AS taxPercent
  FROM company_charges
  WHERE company_id = ?
  `,
  [proposal.company_id]
);



    // Calculations
    const calcAmount = (qty, rate, discount) => Number(qty) * Number(rate) - ((Number(qty) * Number(rate) * Number(discount || 0)) / 100);
    const calcTax = (amount, percent) => (Number(amount) * Number(percent || 0)) / 100;

    let subtotal = 0, cgstTotal = 0, sgstTotal = 0, igstTotal = 0;



    const computedItems = items.map(it => {
      const amount = calcAmount(it.qty, it.rate, it.discount);
      const cgst = calcTax(amount, it.cgst);
      const sgst = calcTax(amount, it.sgst);
      const igst = calcTax(amount, it.igst);
      const total = amount + cgst + sgst + igst;

      subtotal += amount;
      cgstTotal += cgst;
      sgstTotal += sgst;
      igstTotal += igst;

      return { ...it, amount, cgst, sgst, igst, total };
    });
let chargesAmount = 0;
let chargesTax = 0;

charges.forEach(c => {
  const amt = Number(c.amount || 0);
  const taxPct = Number(c.taxPercent || 0);
  const tax = (amt * taxPct) / 100;

  chargesAmount += amt;
  chargesTax += tax;
});




const totalTax = cgstTotal + sgstTotal + igstTotal + chargesTax;

const grandTotal =
  subtotal +
  cgstTotal +
  sgstTotal +
  igstTotal +
  chargesAmount +
  chargesTax;


   const formattedDate = proposal.proposal_date
  ? new Date(proposal.proposal_date).toISOString().slice(0, 10)
  : "";


    // Logo and fonts
    const logoPath = path.join(process.cwd(), "public/images/favicon.png");
    const logoExists = fs.existsSync(logoPath);

    const openSansRegular = path.join(process.cwd(), "public/fonts/OpenSans_Condensed-Regular.ttf");
    const openSansBold = path.join(process.cwd(), "public/fonts/OpenSans_Condensed-Bold.ttf");

    // PDFKit doc
    const doc = new PDFDocument({ size: "A4", margin: 40,font: openSansRegular });
    const chunks = [];
    doc.on("data", chunk => chunks.push(chunk));

    // HEADER
const headerTop = 40;

// Logo (top-left)
if (logoExists) {
  doc.image(logoPath, 40, headerTop, { width: 55 });
}

// Company info
doc.font(openSansBold)
  .fontSize(12)
  .text("Indihands – The Art Craft Nook", 110, headerTop);

doc.font(openSansRegular)
  .fontSize(10)
  .text("Pune, Maharashtra, India", 110, headerTop + 16)
  .text("+91 98765 43210", 110, headerTop + 30)
  .text("support@indihands.com", 110, headerTop + 44);

// Quotation number (top-right)
doc.font(openSansBold)
  .fontSize(11)
  .text(`#${proposal.proposal_number}`, 0, headerTop, {
    align: "right",
    width: 555
  });

   // QUOTATION INFO
const leftX = 40;
const leftWidth = 350;

let y = 110;

// Title
doc.font(openSansBold)
   .fontSize(12)
   .text("Quotation", leftX, y, { underline: true });

y += 18;

// Quotation No
doc.font(openSansRegular)
   .fontSize(10)
   .text(`Quotation No: ${proposal.proposal_number}`, leftX, y, {
     width: leftWidth
   });

y += 14;

doc.text(`To: ${proposal.clientName || ""}`, leftX, y, { width: leftWidth });
y = doc.y;

doc.text(`Phone: ${proposal.clientPhone || ""}`, leftX, y, { width: leftWidth });
y = doc.y;

doc.text(`Email: ${proposal.clientEmail || ""}`, leftX, y, { width: leftWidth });
y = doc.y;


// Company
doc.text(`Company : ${proposal.company || ""}`, leftX, y, {
  width: leftWidth
});
y = doc.y;

// GSTIN
doc.text(`GSTIN: ${proposal.gstin || ""}`, leftX, y, {
  width: leftWidth
});
y = doc.y;

// Place of Supply
doc.text(`Place of Supply: ${proposal.place || ""}`, leftX, y, {
  width: leftWidth,
  ellipsis: true // prevents unwanted second line
});
y = doc.y + 6;

// Billing Address
doc.font(openSansBold).text("Billing Address:", leftX, y);
y = doc.y;

doc.font(openSansRegular)
   .text(proposal.billing_address || "", leftX, y, {
     width: leftWidth,
     lineGap: 2
   });

y = doc.y + 6;

// Shipping Address
doc.font(openSansBold).text("Shipping Address:", leftX, y);
y = doc.y;

doc.font(openSansRegular)
   .text(proposal.shipping_address || "", leftX, y, {
     width: leftWidth,
     lineGap: 2
   });

    doc.text(`Date: ${formattedDate}`, 400, y, { align: "right" });

    // TABLE
    y = doc.y + 20;
    const tableTop = y;
const colX = [
  40,  // Sr No
  70,  // Description      (40 + 30)
  240, // HSN              (70 + 170)
  280, // Qty              (240 + 40)
  315, // Rate             (280 + 35)
  355, // Discount         (315 + 40)
  395, // Amount           (355 + 40)
  435, // CGST             (395 + 40)
  465, // SGST             (435 + 30)
  495, // IGST             (465 + 30)
  525  // Total            (495 + 30)
];


const colWidth = [
  30,  // Sr No
  170, // Description
  40,  // HSN
  35,  // Qty
  40,  // Rate
  40,  // Discount
  40,  // Amount
  30,  // CGST
  30,  // SGST
  30,  // IGST
  40   // Total
];


    // Header
    doc.font(openSansBold).fontSize(9);
    const headers = ["Sr No", "Description", "HSN/SAC", "Qty", "Rate", "Discount", "Amount", "CGST", "SGST", "IGST", "Total"];
    headers.forEach((h, i) => {
      doc.rect(colX[i], y, colWidth[i], 20).stroke();
      doc.text(h, colX[i] + 2, y + 5, { width: colWidth[i] - 4, align: "center" });
    });
    y += 20;
    doc.font(openSansRegular);

    // Rows
    if (computedItems.length === 0) {
  doc.text("No line items. Charges applied.", colX[1], y + 8);
  y += 30;
} else {
    computedItems.forEach((x, i) => {
const rowHeight = Math.max(
  doc.heightOfString(x.description, {
    width: colWidth[1] - 6,
    lineGap: 2
  }) + 8,
  24
);

      // Draw cell borders
      colX.forEach((xPos, idx) => {
        doc.rect(xPos, y, colWidth[idx], rowHeight).stroke();
      });

      // Fill data
      doc.text(i + 1, colX[0] + 2, y + 5, { width: colWidth[0] - 4, align: "center" });
      doc.text(x.description, colX[1] + 2, y + 5, { width: colWidth[1] - 4 });
      doc.text(x.hsn || "", colX[2] + 2, y + 5, { width: colWidth[2] - 4, align: "center" });
      doc.text(Number(x.qty).toFixed(2), colX[3] + 2, y + 5, { width: colWidth[3] - 4, align: "right" });
      doc.text(Number(x.rate).toFixed(2), colX[4] + 2, y + 5, { width: colWidth[4] - 4, align: "right" });
      doc.text(Number(x.discount || 0).toFixed(2), colX[5] + 2, y + 5, { width: colWidth[5] - 4, align: "right" });
      doc.text(Number(x.amount).toFixed(2), colX[6] + 2, y + 5, { width: colWidth[6] - 4, align: "right" });
      doc.text(Number(x.cgst).toFixed(2), colX[7] + 2, y + 5, { width: colWidth[7] - 4, align: "right" });
      doc.text(Number(x.sgst).toFixed(2), colX[8] + 2, y + 5, { width: colWidth[8] - 4, align: "right" });
      doc.text(Number(x.igst).toFixed(2), colX[9] + 2, y + 5, { width: colWidth[9] - 4, align: "right" });
      doc.text(Number(x.total).toFixed(2), colX[10] + 2, y + 5, { width: colWidth[10] - 4, align: "right" });

      y += rowHeight;
    });
  }

// ================= TOTALS TABLE =================
y += 20;

// Table position & sizing
const totalsTableX = 340;
const labelColWidth = 135;
const valueColWidth = 80;
const rowHeight = 24;



const totalsData = [
  ["Total Before Tax", subtotal.toFixed(2)],
  ["CGST Total", cgstTotal.toFixed(2)],
  ["SGST Total", sgstTotal.toFixed(2)],
  ["IGST Total", igstTotal.toFixed(2)],
  ["Total Tax", totalTax.toFixed(2)],
  ...(chargesAmount > 0
    ? [
        ["Additional Charges", chargesAmount.toFixed(2)],
        ["Charges Tax", chargesTax.toFixed(2)],
      ]
    : []),
  ["GRAND TOTAL", grandTotal.toFixed(2), true]
];



totalsData.forEach(([label, value, isBold]) => {
  // Left cell (label)
  doc
    .rect(totalsTableX, y, labelColWidth, rowHeight)
    .stroke();

  doc
    .font(isBold ? openSansBold : openSansRegular)
    .fontSize(10)
    .text(label, totalsTableX + 6, y + 7, {
      width: labelColWidth - 12,
      align: "left"
    });

  // Right cell (value)
  doc
    .rect(totalsTableX + labelColWidth, y, valueColWidth, rowHeight)
    .stroke();

  doc
    .font(isBold ? openSansBold : openSansRegular)
    .text(`₹ ${value}`, totalsTableX + labelColWidth + 4, y + 7, {
      width: valueColWidth - 12,
      align: "right"
    });

  y += rowHeight;
});

if (charges.length > 0) {
  y += 30;
  doc.font(openSansBold).text("Additional Charges:", 40, y);
  y += 12;

  doc.font(openSansRegular);
charges.forEach((c, i) => {
  const tax = (Number(c.amount) * Number(c.taxPercent || 0)) / 100;

  doc.text(
    `${i + 1}. ${c.label}: ₹ ${Number(c.amount).toFixed(2)}`
      + (c.taxPercent ? ` (+${c.taxPercent}% = ₹ ${tax.toFixed(2)})` : ""),
    60,
    y
  );
  y += 12;
});

}


    // Terms
    y += 30;
    const terms = [
      "Payment within 15 days from invoice date.",
      "Delivery within 7 working days from order confirmation.",
      "Warranty as per manufacturer terms.",
      "Goods once sold will not be taken back.",
      "All disputes subject to Pune jurisdiction.",
    ];
    doc.font(openSansBold).text("Terms & Conditions:", 40, y);
    doc.font(openSansRegular);
    terms.forEach((t, i) => {
      y += 12;
      doc.text(`${i + 1}. ${t}`, 60, y);
    });

    doc.end();

    const pdfBuffer = await new Promise(resolve => {
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
    });

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${proposal.proposal_number}.pdf"`,
      },
    });

  } catch (err) {
    console.error("GET /api/proposals/pdf/[rfqid] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
