import { db } from "../../../../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

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

    /* ================= JWT ================= */
    const token = jwt.sign(
      {
        branchId: branch.id,
        companyId: branch.company_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
        issuer: "indihands",
      }
    );

    /* ================= RESPONSE ================= */
    const res = NextResponse.json({
      success: true,
      user: {
        branchId: branch.id,
        companyId: branch.company_id,
        branchName: branch.branch_name,
        email: branch.login_email,
      },
    });

    /* ================= COOKIE (PRODUCTION SAFE) ================= */
    res.cookies.set("client_token", token, {
      httpOnly: true,
      secure: true, 
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return res;

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
