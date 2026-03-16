"use client";

import { useEffect, useState } from "react";
import ClientSidebar from "./ClientSidebar";
import styles from "./clientLayout.module.css";

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
        className={`${styles.pageContent} ${!collapsed ? styles.openContent : styles.collapsedContent}`}
      >
      
          <>
            {children}
          </>
      </main>
    </div>
  );
}
