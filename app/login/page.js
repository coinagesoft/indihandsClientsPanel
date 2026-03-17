"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function ClientLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/client/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("client_token", data.token);
      localStorage.setItem("client_user", JSON.stringify(data.user));

      /* ✅ REDIRECT */
      router.push("/client/dashboard");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      {/* LEFT PANEL */}
      <div className={styles.leftPanel}>
        <img
          src="/images/favicon.png"
          className={styles.logo}
          alt="IndiHands"
        />

        <div className={styles.loginCard}>
          <h2 className={styles.title}>Client Login</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email Address"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email Address"
            />

            {/* PASSWORD WITH EYE */}
            <div className={styles.passwordBox}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
              />

              <span
                className={styles.eye}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <p className={styles.errorText}>{error || "\u00A0"}</p>

            <button
              type="submit"
              className={styles.loginBtn}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <img
              src="/images/line_img.png"
              className={styles.lineLogo}
              alt="mandala"
            />
          </form>
        </div>

        <div className={styles.bottomSection}>
          <img
            src="/images/MTDS-pvt-ltd.png"
            className={styles.designStudio}
            alt="mandala"
          />

          <p className={styles.footer}>
            © 2026 | IndiHands | www.indihands.com
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={styles.rightPanel} />
    </div>
  );
}
