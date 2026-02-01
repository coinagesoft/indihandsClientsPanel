import { db } from "../../../../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { email, password } = await req.json();

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

  /* ✅ CREATE JWT */
  const token = jwt.sign(
    {
      branchId: branch.id,
      companyId: branch.company_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  /* ✅ MANUAL COOKIE (THIS FIXES IT) */
  return new NextResponse(
    JSON.stringify({
      success: true,
      user: {
        branchId: branch.id,
        companyId: branch.company_id,
        branchName: branch.branch_name,
        email: branch.login_email,
      },
      
    }),
    
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `client_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
      },
      
    }
  );
}
