"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./forgotPassword.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirm) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/client/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password");
        return;
      }

      alert("✅ Password reset successful");
      router.push("/client/login");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Forgot Password</h2>
        <p className={styles.subTitle}>
          Reset your account password
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* EMAIL */}
          <input
            type="email"
            placeholder="Registered Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* NEW PASSWORD */}
          <div className={styles.passwordBox}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className={styles.eye}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className={styles.passwordBox}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              className={styles.input}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <span
              className={styles.eye}
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? "🙈" : "👁️"}
            </span>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? "Saving..." : "Reset Password"}
          </button>

          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.push("/login")}
          >
            ← Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}
