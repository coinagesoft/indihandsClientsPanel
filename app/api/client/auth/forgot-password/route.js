export const runtime = "nodejs";

import { db } from "../../../../db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    /* ===== CHECK EMAIL EXISTS ===== */
    const [[branch]] = await db.query(
      `
      SELECT id
      FROM company_branches
      WHERE login_email = ?
      LIMIT 1
      `,
      [email]
    );

    if (!branch) {
      return Response.json(
        { message: "Email not registered" },
        { status: 404 }
      );
    }

    /* ===== HASH PASSWORD ===== */
    const passwordHash = await bcrypt.hash(password, 10);

    /* ===== UPDATE PASSWORD ===== */
    await db.query(
      `
      UPDATE company_branches
      SET password_hash = ?
      WHERE id = ?
      `,
      [passwordHash, branch.id]
    );

    return Response.json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (err) {
    console.error("Forgot password API error:", err);
    return Response.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
