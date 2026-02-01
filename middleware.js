import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  const token = req.cookies.get("client_token")?.value;
  const { pathname } = req.nextUrl;

  const protectedRoutes = [
    // "/client/dashboard",
    // "/client/profile",
    // "/client/rfq-history",
    // "/client/quote-cart",
    // "/client/proposal-details",
    // "/client/product-catalog",
  ];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ❌ Not logged in
  if (isProtected && !token) {
    return NextResponse.redirect(
      new URL("/login", req.url) // ✅ CORRECT
    );
  }

  // 🔐 Verify token
  if (isProtected && token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      const res = NextResponse.redirect(
        new URL("/login", req.url)
      );
      res.cookies.delete("client_token");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/clien/:path*"],
};
