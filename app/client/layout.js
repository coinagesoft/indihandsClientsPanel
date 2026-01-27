"use client";

import { useState } from "react";
import ClientSidebar from "./ClientSidebar";
import styles from "./clientLayout.module.css";

export default function ClientLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

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
        {children}
      </main>
    </div>
  );
}
