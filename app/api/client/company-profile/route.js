import { NextResponse } from "next/server";
import { db } from "../../../db";

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




export async function GET() {
  try {
    const companyId = 1; // TODO: from auth
    const branchId = 1;  // TODO: from auth

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
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    /* ===== BRANCHES ===== */
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
      id: b.id,
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
      branches: formattedBranches,
      active_branch_id: branchId,
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
    const {
      branch_id,
      billing_address,
      shipping_address,
      primary_contact
    } = await req.json();

    if (!branch_id) {
      return NextResponse.json(
        { error: "Branch ID required" },
        { status: 400 }
      );
    }

    await db.query(
      `
      UPDATE company_branches
      SET
        billing_address = ?,
        shipping_address = ?,       -- ✅ FIX
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
        branch_id
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


