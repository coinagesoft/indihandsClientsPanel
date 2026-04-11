import PDFDocument from "pdfkit";
import { db } from "../../../../db";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  try {
    /* ✅ FIX params */
    const { rfqId } =  await params;
    const rfq_id = Number(rfqId);

    if (!rfq_id) {
      return Response.json({ message: "Invalid RFQ ID" }, { status: 400 });
    }

    /* ================= RFQ ================= */
    const [[rfq]] = await db.query(
      `
      SELECT 
        r.id,
        r.rfq_number,
        r.status,
        r.submitted_at,

        r.client_name,
        r.client_phone,
        r.client_email,

        c.company_name,
        cb.contact_person
      FROM rfqs r
      JOIN companies c ON c.id = r.company_id
      JOIN company_branches cb ON cb.id = r.branch_id
      WHERE r.id = ?
      `,
      [rfq_id]
    );

    if (!rfq) {
      return Response.json({ message: "RFQ not found" }, { status: 404 });
    }

    /* ================= ITEMS ================= */
    const [items] = await db.query(
      `
      SELECT 
      CASE 
      WHEN cpp.prefix IS NOT NULL AND cpp.prefix != ''
      THEN CONCAT(cpp.prefix, ' | ', p.product_name)
      ELSE p.product_name
    END AS product_name, 
      rp.quantity, rp.quoted_price
      FROM rfq_products rp
      JOIN products p ON p.id = rp.product_id

  LEFT JOIN company_product_pricing cpp
    ON cpp.product_id = p.id
    AND cpp.company_id = (
      SELECT company_id FROM rfqs WHERE id = ?
    )

      WHERE rp.rfq_id = ?
      `,
     [rfq_id, rfq_id]   
    );

    /* ================= FONTS ================= */
 const openSansRegular = path.join(
  process.cwd(),
  "public/fonts/Myreid/MyriadPro-Regular.otf"
);

const openSansBold = path.join(
  process.cwd(),
  "public/fonts/Philosopher/Philosopher-Bold.ttf"
);

    /* ================= PDF ================= */
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      font: openSansRegular,
    });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    /* ================= LOGO ================= */
/* ================= HEADER ================= */

const headerY = 40;

const logoPath = path.join(
  process.cwd(),
  "public/images/MTDS-pvt-ltd.png"
);

if (fs.existsSync(logoPath)) {
  doc.image(logoPath, 40, headerY, { width: 90 });
}

/* ================= TITLE ================= */

doc.font(openSansBold)
  .fontSize(16)
  .text(
    "REQUEST FOR QUOTATION",
    0,
    headerY + 25,     // align vertically with logo center
    {
      align: "center",
      width: doc.page.width
    }
  );

    /* ================= META ================= */
    let y = 110;
    doc.font(openSansRegular).fontSize(10);

    doc.text(`RFQ No: ${rfq.rfq_number || `RFQ-${rfq.id}`}`, 40, y); y += 14;
    doc.text(
      `Date: ${rfq.submitted_at ? new Date(rfq.submitted_at).toLocaleDateString("en-IN") : ""}`,
      40,
      y
    ); 
    y += 14;

    doc.text(`Status: ${rfq.status}`, 40, y); y += 14;

    /* ✅ CLIENT DETAILS */
    doc.text(`Client: ${rfq.client_name || rfq.contact_person || ""}`, 40, y); 
    y += 14;

    if (rfq.client_phone)
      { doc.text(`Phone: ${rfq.client_phone}`, 40, y); y += 14; }

    if (rfq.client_email)
      { doc.text(`Email: ${rfq.client_email}`, 40, y); y += 14; }

    doc.text(`Company: ${rfq.company_name}`, 40, y);

    /* ================= TABLE ================= */
    y += 30;

    const colX = [40, 70, 380, 440, 510];
    const colW = [30, 310, 60, 70, 70];
    const headers = ["#", "Product", "Qty", "Rate", "Total"];

    doc.font(openSansBold).fontSize(9);

    headers.forEach((h, i) => {
      doc.rect(colX[i], y, colW[i], 22).stroke();
      doc.text(h, colX[i] + 4, y + 6, {
        width: colW[i] - 8,
        align: i === 1 ? "left" : "center",
      });
    });

    y += 22;
    doc.font(openSansRegular);

    items.forEach((item, i) => {
      const qty = Number(item.quantity);
      const rate = Number(item.quoted_price);
      const total = qty * rate;

      const row = [
        i + 1,
        item.product_name,
        qty,
        ` ${rate.toFixed(2)}`,
        ` ${total.toFixed(2)}`,
      ];

      row.forEach((val, c) => {
        doc.rect(colX[c], y, colW[c], 22).stroke();
        doc.text(String(val), colX[c] + 1, y + 6, {
          width: colW[c] - 8,
          align: c === 1 ? "left" : "right",
        });
      });

      y += 22;
    });

    /* ================= FOOTER ================= */
    y += 30;
    doc.fontSize(9).text(
      "This is a system generated RFQ and does not require signature.",
      40,
      y,
      { width: 520, align: "center" }
    );

    doc.end();

    const pdfBuffer = await new Promise(resolve =>
      doc.on("end", () => resolve(Buffer.concat(buffers)))
    );

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${rfq.rfq_number || rfq.id}.pdf"`,
      },
    });

  } catch (err) {
    console.error("RFQ PDF Error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}

