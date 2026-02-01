export const runtime = "nodejs";

import puppeteer from "puppeteer";
import { db } from "../../../../db";
import fs from "fs";
import path from "path";

export async function GET(req, { params }) {
  try {
     const { rfqId } = await params;

    if (!rfqId) {
      return Response.json({ message: "Invalid RFQ ID" }, { status: 400 });
    }

    /* ================= RFQ ================= */
    const [[rfq]] = await db.query(
      `
      SELECT r.id, r.status, r.submitted_at,
             c.company_name,
             cb.contact_person
      FROM rfqs r
      JOIN companies c ON c.id = r.company_id
      JOIN company_branches cb ON cb.id = r.branch_id
      WHERE r.id = ?
      `,
      [rfqId]
    );

    if (!rfq) {
      return Response.json({ message: "RFQ not found" }, { status: 404 });
    }

    /* ================= ITEMS ================= */
    const [items] = await db.query(
      `
      SELECT p.product_name, rp.quantity, rp.quoted_price
      FROM rfq_products rp
      JOIN products p ON p.id = rp.product_id
      WHERE rp.rfq_id = ?
      `,
      [rfqId]
    );

    /* ================= LOGO ================= */
    const logoPath = path.join(
      process.cwd(),
      "public/images/favicon.png"
    );
    const logoBase64 = fs.readFileSync(logoPath).toString("base64");
    const logoSrc = `data:image/png;base64,${logoBase64}`;

    /* ================= HTML ================= */
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
    h2 { text-align: center; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #ccc; padding: 6px; }
    th { background: #f0f0f0; }
    .right { text-align: right; }
    .logo { height: 45px; }
  </style>
</head>
<body>

  <img src="${logoSrc}" class="logo" />

  <h2>REQUEST FOR QUOTATION</h2>

  <p><b>RFQ No:</b> RFQ-${rfq.id}</p>
  <p><b>Date:</b> ${new Date(rfq.submitted_at).toLocaleDateString("en-IN")}</p>
  <p><b>Status:</b> ${rfq.status}</p>
  <p><b>Customer:</b> ${rfq.contact_person}</p>
  <p><b>Company:</b> ${rfq.company_name}</p>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Product</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map((item, i) => {
          const total = item.quantity * item.quoted_price;
          return `
            <tr>
              <td>${i + 1}</td>
              <td>${item.product_name}</td>
              <td class="right">${item.quantity}</td>
              <td class="right">₹ ${Number(item.quoted_price).toFixed(2)}</td>
              <td class="right">₹ ${total.toFixed(2)}</td>
            </tr>
          `;
        })
        .join("")}
    </tbody>
  </table>

  <p style="margin-top:30px; text-align:center; font-size:10px;">
    This is a system generated RFQ and does not require signature.
  </p>

</body>
</html>
`;

    /* ================= PDF ================= */
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="RFQ-${rfq.id}.pdf"`,
      },
    });

  } catch (err) {
    console.error("RFQ PDF Error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}
