"use client";

import { useState } from "react";
import ClientSidebar from "./ClientSidebar";
import styles from "./clientLayout.module.css";
import Footer from "./Footer/page"
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
        <Footer/>
      </main>
    </div>
  );
}
