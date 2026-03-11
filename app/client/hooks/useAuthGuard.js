// "use client";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

// export default function useAuthGuard() {
//   const router = useRouter();

//   useEffect(() => {
//     const token = localStorage.getItem("client_token");

//     if (!token) {
//       router.replace("/login");
//     }
//   }, [router]);
// }


"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("client_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem("client_token");
        router.replace("/login");
      }
    } catch (error) {
      localStorage.removeItem("client_token");
      router.replace("/login");
    }

  }, [router]);
}