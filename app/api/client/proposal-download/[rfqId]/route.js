import puppeteer from "puppeteer";
import { db } from "../../../../db";
import fs from "fs";
import path from "path";

export async function GET(req, { params }) {
  try {
    // ✅ Next.js dynamic params fix
    const { rfqId } = await params;
    const rfqid = Number(rfqId);

    if (!rfqid) {
      return Response.json({ message: "Invalid rfqId" }, { status: 400 });
    }

    // ✅ Proposal data fetch
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
        c.company_name AS company,
        cb.contact_person AS customerName,
        cb.gstin
      FROM proposals p
      JOIN rfqs r ON r.id = p.rfq_id
      JOIN companies c ON c.id = r.company_id
      JOIN company_branches cb ON cb.id = r.branch_id
      WHERE p.rfq_id = ?
      LIMIT 1
      `,
      [rfqId]
    );

    if (!proposal) {
      return Response.json(
        { message: "Proposal not found for this RFQ" },
        { status: 404 }
      );
    }

    // ✅ Proposal Items fetch
    const [items] = await db.query(
      `
      SELECT 
        pi.quantity AS qty,
        pi.rate,
        pi.discount,
        pi.cgst_rate AS cgst,
        pi.sgst_rate AS sgst,
        pi.igst_rate AS igst,
        pr.product_name AS description,
        pr.hsn
      FROM proposal_items pi
      JOIN products pr ON pr.id = pi.product_id
      WHERE pi.proposal_id = ?
      ORDER BY pi.id ASC
      `,
      [proposal.id]
    );

    // ✅ calculations helpers
    const calcAmount = (qty, rate, discount) => {
      const base = Number(qty) * Number(rate);
      const disc = (base * Number(discount || 0)) / 100;
      return base - disc;
    };

    const calcTax = (amount, percent) =>
      (Number(amount) * Number(percent || 0)) / 100;

    let subtotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const computedItems = items.map((it) => {
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

    const totalTax = cgstTotal + sgstTotal + igstTotal;
    const grandTotal = subtotal + totalTax;

    // ✅ Date format same as UI (YYYY-MM-DD)
const formattedDate = new Date().toISOString().slice(0, 10);


    // ✅ LOGO as Base64 (100% works in PDF)
    const logoPath = path.join(process.cwd(), "public/images/favicon.png");
    const logoBase64 = fs.readFileSync(logoPath).toString("base64");
    const logoSrc = `data:image/png;base64,${logoBase64}`;

    // ✅ Exact UI-like HTML (no extra data)
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
        .headerBox { background:#f4f5f7; padding:15px; border-radius:10px; margin-bottom:15px; }
        .row { display:flex; justify-content:space-between; align-items:flex-start; }
        h3,h4,h5 { margin:4px 0; }
        table { width:100%; border-collapse: collapse; margin-top:10px; }
        th, td { border:1px solid #ccc; padding:6px; font-size:11px; }
        th { background:#e7f1ff; }
        .right { text-align:right; }
        .bold { font-weight:bold; }
        .terms li{ margin-bottom:4px; }
        .logo { height:50px; margin-bottom:8px; }
      </style>
    </head>
    <body>

      <div class="headerBox">
        <div class="row">
          <div style="width:65%">
            <img class="logo" src="${logoSrc}" alt="Logo" />
            <h5>Indihands – The Art Craft Nook</h5>
            <div>Pune, Maharashtra, India</div>
            <div>+91 98765 43210</div>
            <div>support@indihands.com</div>
          </div>

          <div style="width:35%" class="right">
            <h4>#${proposal.proposal_number}</h4>
          </div>
        </div>
      </div>

      <div>
        <div class="row">
          <div style="width:70%">
            <h3>Quotation</h3>
            <div><b>Quotation No:</b> ${proposal.proposal_number}</div>
            <div><b>To:</b> ${proposal.customerName || ""}</div>
            <div>${proposal.company || ""}</div>
            <div><b>GSTIN:</b> ${proposal.gstin || ""}</div>
            <div><b>Place of Supply:</b> ${proposal.place || ""}</div>

            <br/>
            <div><b>Billing Address</b></div>
            <div>${proposal.billing_address || ""}</div>

            <br/>
            <div><b>Shipping Address</b></div>
            <div>${proposal.shipping_address || ""}</div>
          </div>

          <div style="width:30%" class="right">
            <div><b>Date:</b> ${formattedDate}</div>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Sr No</th>
            <th>Description</th>
            <th>HSN/SAC</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Discount</th>
            <th>Amount</th>
            <th>CGST</th>
            <th>SGST</th>
            <th>IGST</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          ${computedItems
            .map(
              (x, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${x.description}</td>
              <td>${x.hsn || ""}</td>
              <td class="right">${x.qty}</td>
              <td class="right">${Number(x.rate).toFixed(2)}</td>
              <td class="right">${Number(x.discount || 0).toFixed(2)}</td>
              <td class="right">${x.amount.toFixed(2)}</td>
              <td class="right">${x.cgst.toFixed(2)}</td>
              <td class="right">${x.sgst.toFixed(2)}</td>
              <td class="right">${x.igst.toFixed(2)}</td>
              <td class="right bold">${x.total.toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <br/>

      <table style="width:40%; margin-left:auto;">
        <tr><td>Total Before Tax</td><td class="right">₹ ${subtotal.toFixed(2)}</td></tr>
        <tr><td>CGST Total</td><td class="right">₹ ${cgstTotal.toFixed(2)}</td></tr>
        <tr><td>SGST Total</td><td class="right">₹ ${sgstTotal.toFixed(2)}</td></tr>
        <tr><td>IGST Total</td><td class="right">₹ ${igstTotal.toFixed(2)}</td></tr>
        <tr><td>Total Tax</td><td class="right">₹ ${totalTax.toFixed(2)}</td></tr>
        <tr class="bold"><td>GRAND TOTAL</td><td class="right">₹ ${grandTotal.toFixed(2)}</td></tr>
      </table>

      <br/>
      <h4>Terms & Conditions:</h4>
      <ol class="terms">
        <li>Payment within 15 days from invoice date.</li>
        <li>Delivery within 7 working days from order confirmation.</li>
        <li>Warranty as per manufacturer terms.</li>
        <li>Goods once sold will not be taken back.</li>
        <li>All disputes subject to Pune jurisdiction.</li>
      </ol>

    </body>
    </html>
    `;

    // ✅ Puppeteer PDF
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

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
