"use client";

import styles from "./Footer.module.css";

export default function page() {
  return (
    <footer className={styles.footer}>
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
