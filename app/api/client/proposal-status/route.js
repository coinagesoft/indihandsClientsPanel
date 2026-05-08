export const runtime = "nodejs";
import { db } from "../../../db";
import { NextResponse } from "next/server";
import { verifyToken } from "../../../lib/auth";



import nodemailer from "nodemailer";

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}





export async function POST(req) {
  try {
    const { proposalId, status } = await req.json();
  console.log("=== PROPOSAL STATUS API HIT ===");
    console.log("proposalId:", proposalId, "status:", status);
    console.log("SMTP_USER:", process.env.SMTP_USER ? "✅ SET" : "❌ MISSING");
    console.log("SMTP_PASS:", process.env.SMTP_PASS ? "✅ SET" : "❌ MISSING");
    console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL ? "✅ SET" : "❌ MISSING")
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!proposalId || !status) {
      return NextResponse.json({ message: "Invalid" }, { status: 400 });
    }

     let mailSent = false;  
    /* 1️⃣ UPDATE */
    await db.query(
      `UPDATE proposals SET status=? WHERE id=?`,
      [status, proposalId]
    );

    /* 2️⃣ FETCH COMMON DATA */
    const [[row]] = await db.query(`
      SELECT 
        p.proposal_number,
        p.proposal_date,
        p.grand_total,
        c.company_name,
        r.client_email,
        r.client_name,
        r.client_phone,
        cb.branch_name
    FROM proposals p
JOIN rfqs r ON r.id = p.rfq_id
LEFT JOIN companies c ON c.id = r.company_id
LEFT JOIN company_branches cb ON cb.id = r.branch_id
      WHERE p.id=?
    `, [proposalId]);

   if (!row) {
  return NextResponse.json({
    success: false,
    mailSent: false,
    error: "Proposal data not found"
  });
}
const isB2C = !row.company_name;
    /* 3️⃣ MAIL TRANSPORT */
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    /* ================= APPROVED ================= */
    if (status === "Approved") {

     const clientHtml = `
<div style="font-family:Segoe UI,Arial,sans-serif;color:#333">
  <div style="max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden">

    <div style="background:#faf6ef;padding:18px 20px">
      <img src="https://res.cloudinary.com/dxb1whlam/image/upload/v1771752355/manik_trifaley_logo_white_bgdbsp.png"
           style="height:46px">
    </div>

    <div style="padding:22px">
      <h2 style="color:#c47a2c;margin:0 0 10px 0">
        Proposal Approved ✅
      </h2>

      <p>Dear <b>${row.client_name}</b>,</p>

      <p>
        We are pleased to confirm that your proposal has been approved.
      </p>

      <div style="background:#faf6ef;border:1px solid #ead8bf;border-radius:6px;padding:12px 14px;margin:18px 0;line-height:1.6">
        <b>Proposal No:</b> ${row.proposal_number}<br>
        <b>Date:</b> ${formatDate(row.proposal_date)}<br>
       ${!isB2C ? `
  <b>Company:</b> ${row.company_name}<br>
` : ""}
        <b>Grand Total Amount:</b> ₹ ${row.grand_total}
      </div>

      <p>Our team will begin processing your order.</p>

      <br>

      <p>
        Warm regards,<br>
        <b>Manik Trifaley Team</b>
      </p>
    </div>

    <div style="background:#f5f5f5;padding:12px 16px;font-size:12px;color:#666;text-align:center">
      Manik Trifaley Design Studio Pvt Ltd<br>
   
    </div>

  </div>
</div>
`;

     try {
  await transporter.sendMail({
    from: `"IndiHands" <${process.env.SMTP_USER}>`,
    to: row.client_email,
    subject: `Proposal ${row.proposal_number} Approved`,
    html: clientHtml
  });

  mailSent = true;

} catch (mailErr) {
  console.error("CLIENT MAIL ERROR:", mailErr);
}

     const adminHtml = `
<div style="font-family:Segoe UI,Arial,sans-serif;color:#333">

  <h2 style="color:#c47a2c">Client Approved Proposal</h2>

  <p>A client has approved a proposal.</p>

  <table style="border-collapse:collapse;font-size:14px">
    <tr>
      <td style="padding:6px 10px"><b>Proposal No</b></td>
      <td>${row.proposal_number}</td>
    </tr>
    <tr>
      <td style="padding:6px 10px"><b>Date</b></td>
      <td>${formatDate(row.proposal_date)}</td>
    </tr>
    <tr>
      <td style="padding:6px 10px"><b>Name</b></td>
      <td>${row.client_name}</td>
    </tr>
  ${!isB2C ? `
<tr>
  <td><b>Company</b></td>
  <td>${row.company_name}</td>
</tr>

<tr>
  <td><b>Branch</b></td>
  <td>${row.branch_name}</td>
</tr>
` : `
<tr>
  <td><b>Customer Type</b></td>
  <td>B2C</td>
</tr>
`}
    <tr>
      <td style="padding:6px 10px"><b>Email</b></td>
      <td>${row.client_email || "-"}</td>
    </tr>
    <tr>
      <td style="padding:6px 10px"><b>Phone</b></td>
      <td>${row.client_phone || "-"}</td>
    </tr>
    <tr>
      <td style="padding:6px 10px"><b>Grand Total</b></td>
      <td>₹ ${row.grand_total}</td>
    </tr>
  </table>

</div>
`;
try {
  await transporter.sendMail({
    from: `"IndiHands" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,

    subject: isB2C
      ? `Proposal approved by ${row.client_name}`
      : `Proposal approved by ${row.client_name} (${row.branch_name})`,

    html: adminHtml
  });

  mailSent = true;

} catch (mailErr) {
  console.error("ADMIN MAIL ERROR:", mailErr);
}
    }

    /* ================= REJECTED ================= */
    if (status === "Rejected") {

      const adminHtml = `
      <div style="font-family:Segoe UI,Arial">
        <h2 style="color:#c0392b">Proposal Rejected </h2>
        <p>Client rejected a proposal.</p>

        <p>
          <b>Proposal:</b> ${row.proposal_number}<br>
          <b>Date:</b> ${formatDate(row.proposal_date)}<br>
          <b>Client:</b> ${row.client_name}<br>
          <b>Company:</b> ${row.company_name}<br>
          <b>Branch:</b> ${row.branch_name}<br>
          <b>Total:</b> ₹ ${row.grand_total}
        </p>
      </div>`;

     await transporter.sendMail({
  from: `"IndiHands" <${process.env.SMTP_USER}>`,
  to: process.env.ADMIN_EMAIL,

  subject: isB2C
    ? `Proposal Rejected by ${row.client_name}`
    : `Proposal Rejected by ${row.client_name} (${row.branch_name})`,

  html: adminHtml
});
      mailSent = true;
    }
console.log("RETURNING:", { success: true, mailSent });
  return NextResponse.json({ success: true, mailSent });

  }catch (e) {

  console.error(
    "PROPOSAL STATUS ERROR:",
    e
  );

  return NextResponse.json(
    {

      success: false,

      error:
        e.message,

      stack:
        process.env.NODE_ENV ===
        "development"
          ? e.stack
          : undefined
    },
    {
      status: 500
    }
  );
}
}