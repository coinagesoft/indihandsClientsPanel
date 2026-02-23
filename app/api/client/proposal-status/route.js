export const runtime = "nodejs";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";

// export async function POST(req) {
//   try {
//     const { proposalId, status } = await req.json();
//      /* ===== AUTH ===== */
//       let decoded;
//       try {
//         decoded = verifyToken(req);
//       } catch (err) {
//         return NextResponse.json(
//           { error: "Unauthorized" },
//           { status: 401 }
//         );
//       }
  
//       const { companyId, branchId } = decoded;

//     if (!proposalId || !["Approved", "Rejected"].includes(status)) {
//       return Response.json(
//         { message: "Invalid request" },
//         { status: 400 }
//       );
//     }

//     const [[proposal]] = await db.query(
//       `
//       SELECT id, status
//       FROM proposals
//       WHERE id = ? AND company_id = ?
//       `,
//       [proposalId, companyId]
//     );

//     if (!proposal) {
//       return Response.json(
//         { message: "Proposal not found" },
//         { status: 404 }
//       );
//     }

//     if (["Approved", "Rejected"].includes(proposal.status)) {
//       return Response.json(
//         { message: "Proposal already finalized" },
//         { status: 400 }
//       );
//     }

//     await db.query(
//       `
//       UPDATE proposals
//       SET status = ?
//       WHERE id = ?
//       `,
//       [status, proposalId]
//     );

//     return Response.json({ success: true });

//   } catch (err) {
//     console.error("proposal-status error:", err);
//     return Response.json(
//       { message: "Server error" },
//       { status: 500 }
//     );
//   }
// }


import nodemailer from "nodemailer";

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// export async function POST(req) {
//   try {
//     const { proposalId, status } = await req.json();

//         let decoded;
//       try {
//         decoded = verifyToken(req);
//       } catch (err) {
//         return NextResponse.json(
//           { error: "Unauthorized" },
//           { status: 401 }
//         );
//       }

//     if (!proposalId || !status) {
//       return Response.json({ message: "Invalid" }, { status: 400 });
//     }

//     /* 1️⃣ UPDATE PROPOSAL STATUS */
//     await db.query(
//       `UPDATE proposals SET status=? WHERE id=?`,
//       [status, proposalId]
//     );

//     /* 2️⃣ ONLY ON APPROVED → SEND MAIL */
//     if (status === "Approved") {

//       /* FETCH EMAIL DATA */
//  const [[row]] = await db.query(`
// SELECT 
//   p.proposal_number,
//   p.proposal_date,
//   p.grand_total,
//   c.company_name,
//   r.client_email,
//   r.client_name,
//   r.client_phone,
//   cb.branch_name
// FROM proposals p
// JOIN rfqs r ON r.id = p.rfq_id
// JOIN companies c ON c.id = r.company_id
// JOIN company_branches cb ON cb.id = r.branch_id
// JOIN company_info ci ON 1=1
// WHERE p.id=?
// `, [proposalId]);

//       if (row) {
//        const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });
// const clientHtml = `
// <div style="font-family:Segoe UI,Arial,sans-serif;color:#333">
//   <div style="max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden">

//     <div style="background:#faf6ef;padding:18px 20px">
//       <img src="https://res.cloudinary.com/dxb1whlam/image/upload/v1771752355/manik_trifaley_logo_white_bgdbsp.png"
//            style="height:46px">
//     </div>

//     <div style="padding:22px">
//       <h2 style="color:#c47a2c;margin:0 0 10px 0">
//         Proposal Approved ✅
//       </h2>

//       <p>Dear <b>${row.client_name}</b>,</p>

//       <p>
//         We are pleased to confirm that your proposal has been approved.
//       </p>

//       <div style="background:#faf6ef;border:1px solid #ead8bf;border-radius:6px;padding:12px 14px;margin:18px 0;line-height:1.6">
//         <b>Proposal No:</b> ${row.proposal_number}<br>
//         <b>Date:</b> ${formatDate(row.proposal_date)}<br>
//         <b>Company:</b> ${row.company_name}<br>
//         <b>Grand Total Amount:</b> ₹ ${row.grand_total}
//       </div>

//       <p>Our team will begin processing your order.</p>

//       <br>

//       <p>
//         Warm regards,<br>
//         <b>Manik Trifaley Team</b>
//       </p>
//     </div>

//     <div style="background:#f5f5f5;padding:12px 16px;font-size:12px;color:#666;text-align:center">
//       Manik Trifaley Design Studio Pvt Ltd<br>
   
//     </div>

//   </div>
// </div>
// `;
//         /* CLIENT MAIL */
//         await transporter.sendMail({
//           from: `"Manik Trifaley" <${process.env.SMTP_USER}>`,
//           to: row.client_email,
//           subject: `Proposal ${row.proposal_number} Approved`,
//           html: clientHtml
       
//         });
// const adminHtml = `
// <div style="font-family:Segoe UI,Arial,sans-serif;color:#333">

//   <h2 style="color:#c47a2c">Client Approved Proposal</h2>

//   <p>A client has approved a proposal.</p>

//   <table style="border-collapse:collapse;font-size:14px">
//     <tr>
//       <td style="padding:6px 10px"><b>Proposal No</b></td>
//       <td>${row.proposal_number}</td>
//     </tr>
//     <tr>
//       <td style="padding:6px 10px"><b>Date</b></td>
//       <td>${formatDate(row.proposal_date)}</td>
//     </tr>
//     <tr>
//       <td style="padding:6px 10px"><b>Name</b></td>
//       <td>${row.client_name}</td>
//     </tr>
//     <tr>
//       <td style="padding:6px 10px"><b>Company</b></td>
//       <td>${row.company_name}</td>
//     </tr>
//     <tr>
//       <td style="padding:6px 10px"><b>Branch</b></td>
//       <td>${row.branch_name}</td>
//     </tr>
//     <tr>
//       <td style="padding:6px 10px"><b>Email</b></td>
//       <td>${row.client_email || "-"}</td>
//     </tr>
//     <tr>
//       <td style="padding:6px 10px"><b>Phone</b></td>
//       <td>${row.client_phone || "-"}</td>
//     </tr>
//     <tr>
//       <td style="padding:6px 10px"><b>Grand Total</b></td>
//       <td>₹ ${row.grand_total}</td>
//     </tr>
//   </table>

// </div>
// `;
//         /* ADMIN MAIL */
//         await transporter.sendMail({
//           from: `"Manik Trifaley" <${process.env.SMTP_USER}>`,
//          to: process.env.ADMIN_EMAIL,
//          subject:`Proposal ${row.proposal_number} approved by ${row.client_name} (${row.branch_name})`,
//              html: adminHtml
//         });
//       }
//     }

//   /* ================= REJECTED ================= */
//     if (status === "Rejected") {

//       const adminHtml = `
//       <div style="font-family:Segoe UI,Arial">
//         <h2 style="color:#c0392b">Proposal Rejected ❌</h2>
//         <p>Client rejected a proposal.</p>

//         <p>
//           <b>Proposal:</b> ${row.proposal_number}<br>
//           <b>Date:</b> ${formatDate(row.proposal_date)}<br>
//           <b>Client:</b> ${row.client_name}<br>
//           <b>Company:</b> ${row.company_name}<br>
//           <b>Branch:</b> ${row.branch_name}<br>
//           <b>Total:</b> ₹ ${row.grand_total}
//         </p>
//       </div>`;

//       await transporter.sendMail({
//         from: `"Manik Trifaley" <${process.env.SMTP_USER}>`,
//         to: process.env.ADMIN_EMAIL,
//         subject: `Proposal ${row.proposal_number} REJECTED by ${row.client_name} (${row.branch_name})`,
//         html: adminHtml
//       });
//     }


//     return Response.json({ success: true });

//   } catch (e) {
//     console.error(e);
//     return Response.json({ message: "Server error" }, { status: 500 });
//   }
// }


export async function POST(req) {
  try {
    const { proposalId, status } = await req.json();

    let decoded;
    try {
      decoded = verifyToken(req);
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!proposalId || !status) {
      return Response.json({ message: "Invalid" }, { status: 400 });
    }

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
      JOIN companies c ON c.id = r.company_id
      JOIN company_branches cb ON cb.id = r.branch_id
      WHERE p.id=?
    `, [proposalId]);

    if (!row) return Response.json({ success: true });

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
        <b>Company:</b> ${row.company_name}<br>
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

      await transporter.sendMail({
        from: `"IndiHands" <${process.env.SMTP_USER}>`,
        to: row.client_email,
        subject: `Proposal ${row.proposal_number} Approved`,
        html: clientHtml
      });
      mailSent = true;

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
    <tr>
      <td style="padding:6px 10px"><b>Company</b></td>
      <td>${row.company_name}</td>
    </tr>
    <tr>
      <td style="padding:6px 10px"><b>Branch</b></td>
      <td>${row.branch_name}</td>
    </tr>
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

      await transporter.sendMail({
        from: `"IndiHands" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `Proposal approved by ${row.client_name} (${row.branch_name})`,
        html: adminHtml
      });
      mailSent = true;
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
        subject: `Proposal Rejected by ${row.client_name} (${row.branch_name})`,
        html: adminHtml
      });
      mailSent = true;
    }

    return Response.json({ success: true });

  } catch (e) {
    console.error(e);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}