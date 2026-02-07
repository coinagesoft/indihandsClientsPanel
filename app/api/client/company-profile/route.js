import { NextResponse } from "next/server";
import { db } from "../../../db";
import { verifyToken } from "../../../lib/auth";


function safeJsonArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === "string" && value.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [value];
}






export async function GET(req) {
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

    /* ===== ONLY LOGGED-IN BRANCH (🔥 FIX) ===== */
    const [[branch]] = await db.query(
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
      WHERE id = ?
        AND company_id = ?
      `,
      [branchId, companyId]
    );

    if (!branch) {
      return NextResponse.json(
        { error: "Branch not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      company: {
        company_name: company.company_name,
        company_email: company.company_email,
      },
      branch: {
        id: branch.id,
        branch_name: branch.branch_name,
        gstin: branch.gstin,
        billing_address: branch.billing_address || "",
        shipping_address: branch.shipping_address || "",
        primary_contact: {
          name: branch.contact_person || "",
          emails: safeJsonArray(branch.emails),
          phones: safeJsonArray(branch.phones),
        },
      },
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

    const { companyId, branchId } = decoded;

    /* ===== BODY ===== */
    const {
      billing_address,
      shipping_address,
      primary_contact,
    } = await req.json();

    /* ===== VALIDATE BRANCH (extra safety) ===== */
    const [[branch]] = await db.query(
      `
      SELECT id
      FROM company_branches
      WHERE id = ?
        AND company_id = ?
      `,
      [branchId, companyId]
    );

    if (!branch) {
      return NextResponse.json(
        { error: "Forbidden: Invalid branch access" },
        { status: 403 }
      );
    }

    /* ===== UPDATE ONLY LOGGED-IN BRANCH ===== */
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
        branchId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Branch profile updated successfully",
    });

  } catch (error) {
    console.error("Company Profile UPDATE Error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}




