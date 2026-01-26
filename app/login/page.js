"use client";

import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function ClientLoginPage() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ API later, now direct redirect
    console.log("Login clicked");

    router.push("/client/dashboard");
  };

  return (
    <div className={styles.loginWrapper}>
      {/* LEFT PANEL */}
      <div className={styles.leftPanel}>
        <div className={styles.borderFrame}></div>

        <div className={styles.loginCard}>
          <h2 className={styles.title}> Login</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="email"
              placeholder="Email Address"
              className={styles.input}
            />

            <input
              type="password"
              placeholder="Password"
              className={styles.input}
            />

            <button type="submit" className={styles.loginBtn}>
              Login
            </button>

            <p className={styles.forgotText}>Forgot Password?</p>
          </form>

          {/* <div className={styles.dots}>*******</div> */}
        </div>
      </div>

      {/* RIGHT IMAGE PANEL */}
      <div className={styles.rightPanel}></div>
    </div>
  );
}
