import { NextResponse } from "next/server";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";
import nodemailer from "nodemailer";

/* ========= GST STATE ========= */
function getStateFromGSTIN(gstin) {
  if (!gstin || gstin.length < 2) return null;
  const code = gstin.substring(0, 2);

  const states = {
    "01": "Jammu & Kashmir",
    "02": "Himachal Pradesh",
    "03": "Punjab",
    "04": "Chandigarh",
    "05": "Uttarakhand",
    "06": "Haryana",
    "07": "Delhi",
    "08": "Rajasthan",
    "09": "Uttar Pradesh",
    "10": "Bihar",
    "11": "Sikkim",
    "12": "Arunachal Pradesh",
    "13": "Nagaland",
    "14": "Manipur",
    "15": "Mizoram",
    "16": "Tripura",
    "17": "Meghalaya",
    "18": "Assam",
    "19": "West Bengal",
    "20": "Jharkhand",
    "21": "Odisha",
    "22": "Chhattisgarh",
    "23": "Madhya Pradesh",
    "24": "Gujarat",
    "25": "Daman & Diu",
    "26": "Dadra & Nagar Haveli",
    "27": "Maharashtra",
    "28": "Andhra Pradesh",
    "29": "Karnataka",
    "30": "Goa",
    "31": "Lakshadweep",
    "32": "Kerala",
    "33": "Tamil Nadu",
    "34": "Puducherry",
    "35": "Andaman & Nicobar",
    "36": "Telangana",
    "37": "Andhra Pradesh"
  };

  return states[code] || null;
}

export async function POST(req) {
  try {
    /* ========= AUTH ========= */
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId, branchId } = decoded;
    const body = await req.json();
    const { clientName, clientPhone, clientEmail, billingType } = body;

    if (!clientName?.trim()) {
      return NextResponse.json({ error: "Client name required" }, { status: 400 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";

    /* ========= FIND DRAFT RFQ ========= */
    const [[rfq]] = await db.query(
      `SELECT id FROM rfqs
       WHERE company_id=? AND branch_id=? AND status='Draft'
       LIMIT 1`,
      [companyId, branchId]
    );

    if (!rfq) {
      return NextResponse.json({ error: "No draft RFQ found" }, { status: 400 });
    }

    /* ========= CHECK CART ========= */
    const [[count]] = await db.query(
      `SELECT COUNT(*) AS total FROM rfq_products WHERE rfq_id=?`,
      [rfq.id]
    );

    if (count.total === 0) {
      return NextResponse.json({ error: "Cannot submit empty RFQ" }, { status: 400 });
    }

    /* ========= SUBMIT RFQ ========= */
    await db.query(
      `UPDATE rfqs
       SET status='Submitted',
           submitted_at=NOW(),
           client_name=?,
           client_phone=?,
           client_email=?,
            billing_type=?
       WHERE id=?`,
      [clientName, clientPhone, clientEmail,billingType, rfq.id]
    );

    const rfqId = rfq.id;

    /* ========= RFQ SNAPSHOT ========= */
    const [[rfqData]] = await db.query(
      `SELECT client_name, client_email, client_phone, rfq_number
       FROM rfqs WHERE id=?`,
      [rfqId]
    );

    /* ========= CLIENT COMPANY ========= */
    const [[company]] = await db.query(
      `SELECT company_name, company_email
       FROM companies WHERE id=?`,
      [companyId]
    );

    /* ========= CLIENT BRANCH ========= */
    const [[branch]] = await db.query(
      `SELECT branch_name, phones, emails, state, gstin
       FROM company_branches WHERE id=?`,
      [branchId]
    );

    /* ========= GST STATE FALLBACK ========= */
    const gstState = getStateFromGSTIN(branch?.gstin);
    const finalState = branch?.state || gstState || "-";

    /* ========= FORMAT BRANCH CONTACT ========= */
    // const branchEmails = branch?.emails?.replace(/,/g, ", ");
    // const branchPhones = branch?.phones?.replace(/,/g, ", ");

    /* ========= EMAIL ========= */
    let mailSent = true;

    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: { rejectUnauthorized: false },
      });

      /* ========= CLIENT MAIL ========= */
      const clientMail = {
        from: `"IndiHands" <${process.env.SMTP_USER}>`,
        to: clientEmail,
        subject: "Your RFQ has been received – IndiHands",
        html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
          <h2 style="color:#c47a2c;margin-bottom:10px">
            Thank you for your request
          </h2>

          <p>Dear ${rfqData?.client_name || clientName},</p>

          <p>
            We have successfully received your Request for Quotation (RFQ).
            Our team is currently reviewing your requirements.
          </p>

          <div style="
            background:#faf6ef;
            border:1px solid #ead8bf;
            padding:12px 14px;
            border-radius:6px;
            margin:14px 0
          ">
            <b>RFQ Reference:</b> #${rfqData?.rfq_number || rfqId}<br/>
            <b>Submitted:</b> ${new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>

          <div style="margin:16px 0">
            <a href="${baseUrl}/client/rfq-history"
               style="
                 display:inline-block;
                 background:#c47a2c;
                 color:#fff;
                 padding:10px 16px;
                 border-radius:4px;
                 text-decoration:none;
                 font-weight:600">
               View Your RFQ Status
            </a>
            <div style="font-size:12px;color:#777;margin-top:6px">
              You can track your RFQ status anytime in your IndiHands account.
            </div>
          </div>

          <p>
            You can expect our quotation and further details shortly.
            If additional information is required, our team will contact you.
          </p>

          <p>
            Warm regards,<br/>
            <b>IndiHands Team</b><br/>
            <span style="color:#777">Handcrafted Excellence</span>
          </p>
        </div>
        `,
      };

      /* ========= ADMIN MAIL ========= */
      const adminMail = {
        from: `"IndiHands RFQ :" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New #${rfqData?.rfq_number || rfqId} – ${
          company?.company_name || "Client"
        }`,
        html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2 style="color:#c47a2c;margin-bottom:8px">New RFQ Submitted</h2>

          <p><b>RFQ ID:</b> ${rfqData?.rfq_number || rfqId}</p>
          <p><b>Submitted On:</b> ${new Date().toLocaleString("en-IN")}</p>

          <hr style="margin:14px 0"/>

          <h3>Client Contact</h3>
          <p><b>Name:</b> ${rfqData?.client_name || "-"}</p>
          <p><b>Email:</b> ${rfqData?.client_email || "-"}</p>
          <p><b>Phone:</b> ${rfqData?.client_phone || "-"}</p>

          <h3 style="margin-top:12px">Company</h3>
          <p><b>Company:</b> ${company?.company_name || "-"}</p>
          <p><b>Branch:</b> ${branch?.branch_name || "-"}</p>
         

         

          <hr style="margin:16px 0"/>

          <p>
            <a href="${baseUrl}/admin/rfq/${rfqId}"
               style="color:#c47a2c;font-weight:600;text-decoration:none">
               Open RFQ in Admin Portal
            </a>
          </p>
        </div>
        `,
      };

      await Promise.all([
        transporter.sendMail(clientMail),
        transporter.sendMail(adminMail),
      ]);
    } catch (mailErr) {
      console.error("Mail error:", mailErr);
      mailSent = false;
    }

    return NextResponse.json({
      success: true,
      rfq_id: rfqId,
      mailSent,
      message: "RFQ submitted successfully",
    });
  } catch (error) {
    console.error("Submit RFQ Error:", error);
    return NextResponse.json(
      { error: "Failed to submit RFQ" },
      { status: 500 }
    );
  }
}