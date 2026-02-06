import { NextResponse } from "next/server";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";


function safeJsonArray(value) {
  if (!value) return [];

  // MySQL JSON column sometimes already returns array
  if (Array.isArray(value)) return value;

  // If value looks like JSON array
  if (typeof value === "string" && value.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Plain string fallback → wrap in array
  return [value];
}




export async function GET(req) {
  try {
    /* ===== AUTH ===== */
    let decoded;
    try {
      decoded = verifyToken(req);
      console.log("decoded",decoded)
    } catch {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { companyId, branchId } = decoded;

    /* ===== COMPANY ===== */
    const [[company]] = await db.query(
      `
      SELECT id, company_name, company_email
      FROM companies
      WHERE id = ?
      `,
      [companyId]
    );

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    /* ===== BRANCHES (🔥 MAIN POINT) ===== */
    const [branches] = await db.query(
      `
      SELECT
        id,
        branch_name,
        gstin,
        billing_address,
        shipping_address,
        contact_person,
        phones,
        emails
      FROM company_branches
      WHERE company_id = ?
      ORDER BY id ASC
      `,
      [companyId]
    );

    const formattedBranches = branches.map(b => ({
      id: b.id, // 🔥 all branch ids of THIS company
      branch_name: b.branch_name,
      gstin: b.gstin,
      billing_address: b.billing_address || "",
      shipping_address: b.shipping_address || "",
      primary_contact: {
        name: b.contact_person || "",
        emails: safeJsonArray(b.emails),
        phones: safeJsonArray(b.phones),
      },
    }));

    return NextResponse.json({
      company: {
        company_name: company.company_name,
        company_email: company.company_email,
      },
      branches: formattedBranches, // ✅ company che sagle branches
      active_branch_id: branchId,   // ✅ logged-in branch
    });

  } catch (error) {
    console.error("Company Profile GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company profile" },
      { status: 500 }
    );
  }
}



export async function PUT(req) {
  try {
    /* ===== AUTH ===== */
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { companyId } = decoded;

    /* ===== BODY ===== */
    const {
      branch_id,
      billing_address,
      shipping_address,
      primary_contact,
    } = await req.json();

    if (!branch_id) {
      return NextResponse.json(
        { error: "Branch ID required" },
        { status: 400 }
      );
    }

    /* ===== SECURITY CHECK 🔥 ===== */
    const [[branch]] = await db.query(
      `
      SELECT id
      FROM company_branches
      WHERE id = ? AND company_id = ?
      `,
      [branch_id, companyId]
    );

    if (!branch) {
      return NextResponse.json(
        { error: "Forbidden: Invalid branch access" },
        { status: 403 }
      );
    }

    /* ===== UPDATE ===== */
    await db.query(
      `
      UPDATE company_branches
      SET
        billing_address = ?,
        shipping_address = ?,
        contact_person = ?,
        phones = ?,
        emails = ?
      WHERE id = ?
      `,
      [
        billing_address || "",
        shipping_address || "",
        primary_contact?.name || "",
        JSON.stringify(primary_contact?.phones || []),
        JSON.stringify(primary_contact?.emails || []),
        branch_id,
      ]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Company Profile UPDATE Error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}



