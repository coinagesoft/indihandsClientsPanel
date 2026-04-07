import { db } from "../../../../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    console.log("identifier", email, "password", password);

    if (!email || !password) {
      return NextResponse.json(
        { message: "Username/Email and password are required" }, // ✅ updated
        { status: 400 }
      );
    }

    const [[branch]] = await db.query(
      `SELECT id, company_id, branch_name, login_email, password_hash
       FROM company_branches
       WHERE login_email = ? LIMIT 1`,
      [email] // ✅ works for both username OR email
    );

    if (!branch) {
      return NextResponse.json(
        { message: "Invalid credentials" }, // ✅ generic
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, branch.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid credentials" }, // ✅ generic
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        branchId: branch.id,
        companyId: branch.company_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
        issuer: "indihands",
      }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        branchId: branch.id,
        companyId: branch.company_id,
        branchName: branch.branch_name,
        identifier: branch.login_email, // ✅ renamed in response
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}