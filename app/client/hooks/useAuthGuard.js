"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("client_token");

    if (!token) {
      router.replace("/login");
    }
  }, [router]);
}
