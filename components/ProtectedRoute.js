"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({
  children,
  tokenKey = "client_token",        // admin default
  redirectTo = "/login",     // admin default
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(tokenKey);

    // ❌ no token
    if (!token) {
      router.replace(redirectTo);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // ❌ expired
      if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem(tokenKey);
        router.replace(redirectTo);
        return;
      }

      setAllowed(true);
    } catch (err) {
      localStorage.removeItem(tokenKey);
      router.replace(redirectTo);
    }
  }, [router, tokenKey, redirectTo]);

  if (!allowed) return null; // or loader

  return children;
}