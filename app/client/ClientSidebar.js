"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "./sidebar.module.css";

export default function ClientSidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", path: "/client/dashboard", icon: "ri-home-4-line" },
    { name: "Product Catalog", path: "/client/product-catalog", icon: "ri-shopping-bag-3-line" },
    { name: "Quote Cart", path: "/client/quote-cart", icon: "ri-shopping-cart-line" },
    { name: "RFQ History", path: "/client/rfq-history", icon: "ri-file-list-3-line" },
    { name: "Proposal Details", path: "/client/proposal-details", icon: "ri-file-text-line" },
    { name: "Profile", path: "/client/profile", icon: "ri-user-3-line" },
    { name: "Process of Packing", path: "/client/process-packing", icon: "ri-box-3-line" },
    { name: "Terms & Conditions", path: "/client/terms", icon: "ri-file-shield-2-line" },
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* LOGO + ARROW */}
      <div className={styles.logoRow}>
        {!collapsed && (
           <a href="/client/dashboard" className="app-brand-link d-flex align-items-center justify-content-center text-center">
    {/* PNG Logo */}
   <div className='d-flex justify-content-center'>
     <img
      src="/images/faviconSidebar.png"  // <-- put your PNG file path here
      alt="Logo"
      style={{ height: 50, width: "auto" }} // adjust height/width as needed
      className=""
    />
     <img
      src="/images/name.png"  // <-- put your PNG file path here
      alt="Logo"
      style={{ height: 40, width: "auto" }} // adjust height/width as needed
      className="me-2 mt-1"
    />
   </div>
 
  </a>
        )}
          
        <button
          className={styles.arrowBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className={`ri-arrow-${collapsed ? "right" : "left"}-s-line`} />
        </button>
      </div>

      {/* MENU */}
      <ul className={styles.menu}>
        {menu.map((item) => {
          const active =
            pathname === item.path ||
            (item.path === "/client/product-catalog" &&
              pathname.startsWith("/client/products"));

          return (
            <li key={item.path} className={active ? styles.active : ""}>
              <Link href={item.path} className={styles.menuLink}>
                <i className={`ri ${item.icon} ${styles.icon}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* FOOTER */}
      {!collapsed && (
        <>
        <div className={styles.footerLogo}>
          <img src="/images/trifoley-logo.png" alt="trifoley" />
        </div>
        </>
      )}
    </aside>
  );
}
