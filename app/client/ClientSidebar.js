"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "./sidebar.module.css";

export default function ClientSidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/client/auth/logout", { method: "POST" });
    } catch {}

    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    router.push("/login");
  };

  const menu = [
    { name: "Dashboard", path: "/client/dashboard", icon: "ri-home-4-line" },
    { name: "Product Catalog", path: "/client/product-catalog", icon: "ri-shopping-bag-3-line" },
    { name: "Quote Cart", path: "/client/quote-cart", icon: "ri-shopping-cart-line" },
    { name: "RFQ History", path: "/client/rfq-history", icon: "ri-file-list-3-line" },
    { name: "Proposal Details", path: "/client/proposal-details", icon: "ri-file-text-line" },
    { name: "Profile", path: "/client/profile", icon: "ri-user-3-line" },
    { name: "Process of Packing", path: "/client/process-packing", icon: "ri-box-3-line" },
    { name: "Terms & Conditions", path: "/client/terms", icon: "ri-file-shield-2-line" },
    { name: "Contact Us", path: "/client/contactus", icon: "ri-customer-service-2-line" },
      {
    name: "Pay Here",
    path: "https://formpayment.getepay.in/forms/survey/WygqPGELe3yrb698jZX1",
    icon: "ri-secure-payment-line",
    external: true
  },
  ];


  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* LOGO + ARROW */}
      <div className={styles.logoRow}>
        {!collapsed && (
          <a href="/client/dashboard" className={styles.logoLink}>
            <img src="/images/favicon.png" alt="Logo" className={styles.logoImg} />
          </a>
        )}

        <button className={styles.arrowBtn} onClick={() => setCollapsed(!collapsed)} >
          <i className={`ri-arrow-${collapsed ? "right" : "left"}-s-line`} />
        </button>
      </div>

      {/* MENU */}
      <ul className={styles.menu}>
        {menu.map((item) => {
          const active =
            pathname === item.path ||

            // product details highlight catalog
            (item.path === "/client/product-catalog" &&
              pathname.startsWith("/client/products")) ||

            // rfq details highlight rfq history
            (item.path === "/client/rfq-history" &&
              pathname.startsWith("/client/rfq-details"));

          return (
         <li key={item.name} className={active ? styles.active : ""}>
  
  {item.external ? (
    // ✅ ADD HERE (for Pay Now)
    <a
      href={item.path}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.menuLink}
    >
      <i className={`ri ${item.icon} ${styles.icon}`} />
      {!collapsed && <span>{item.name}</span>}
    </a>
  ) : (
    // ✅ existing links stay same
    <Link href={item.path} className={styles.menuLink}>
      <i className={`ri ${item.icon} ${styles.icon}`} />
      {!collapsed && <span>{item.name}</span>}
    </Link>
  )}

</li>
          );
        })}
      </ul>

      {/* LOGOUT BUTTON - Separate from menu */}
      {/* <div className={styles.logoutContainer}>
        <button 
          className={styles.logoutBtn} 
          onClick={handleLogout}
        >
          <i className={`ri ri-logout-box-r-line ${styles.icon}`} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div> */}



      {/* FOOTER */}
      
      {!collapsed && (
        <>
          <div className={styles.footerLogo}>
            
            <img src="/images/MTDS-pvt-ltd.png" alt="trifoley" />
          </div>
        </>
      )}
    </aside>
  );
}
