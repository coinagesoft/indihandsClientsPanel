"use client";

import { useEffect, useState } from "react";
import ClientSidebar from "./ClientSidebar";
import styles from "./clientLayout.module.css";
import Footer from "./Footer/page";

export default function ClientLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Stop loader once page content mounts
  useEffect(() => {
    setLoading(false);
  }, [children]);

  return (
    <div className={styles.wrapper}>
      <ClientSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`${styles.pageContent} ${
          collapsed ? styles.collapsedContent : ""
        }`}
      >
        {/* 🔹 MAIN LOADER */}
        {loading && (
          <div className={styles.mainLoader}>
            <div className={styles.spinner}></div>
            <span>Loading...</span>
          </div>
        )}

        {/* 🔹 PAGE CONTENT + FOOTER (AFTER LOAD) */}
        {!loading && (
          <>
            {children}
            <Footer />
          </>
        )}
      </main>
    </div>
  );
}
