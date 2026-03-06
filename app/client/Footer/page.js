"use client";

import styles from "./Footer.module.css";

export default function Footer({ variant = "default" }) {
  return (
    <footer className={`${styles.footer} ${styles[variant]}`}>
      
      <div className={styles.designLayer}></div>

      <img
        src="/images/trilogo.png"
        alt="IndiHands"
        className={styles.logo}
      />

      <div className={styles.text}>
        ©2026 | indiHands | www.indihands.com
      </div>

    </footer>
  );
}