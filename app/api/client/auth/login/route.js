import { db } from "../../../../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
     console.log("email",email,"password",password)
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const [[branch]] = await db.query(
      `SELECT id, company_id, branch_name, login_email, password_hash
       FROM company_branches
       WHERE login_email = ? LIMIT 1`,
      [email]
    );

    if (!branch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, branch.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
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
      token, // ✅ TOKEN RETURN
      user: {
        branchId: branch.id,
        companyId: branch.company_id,
        branchName: branch.branch_name,
        email: branch.login_email,
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
