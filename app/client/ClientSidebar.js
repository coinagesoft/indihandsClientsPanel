"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sidebar.module.css";

export default function ClientSidebar() {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", path: "/client/dashboard" },
    { name: "Product Catalog", path: "/client/product-catalog" },
    { name: "Quote Cart", path: "/client/quote-cart" },
    { name: "RFQ History", path: "/client/rfq-history" },
    { name: "Proposal Details", path: "/client/proposal-details" },
    { name: "Profile", path: "/client/profile" },
    { name: "Process of Packing", path: "/client/process-packing" },
    { name: "Terms & Conditions", path: "/client/terms" },
  ];

  return (
    <aside className={styles.sidebar}>
      {/* LOGO */}
      <div className={styles.logoBox}>
        <img
          src="/images/indihands-logo.png"
          alt="indiHands"
          className={styles.logo}
        />
      </div>

      {/* MENU */}
      <div className={styles.menu}>
        {menu.map((item) => {
          let active = pathname === item.path;

          // ✅ Keep Product Catalog active for Listing + Details pages also
          if (
            item.path === "/client/product-catalog" &&
            pathname.startsWith("/client/products")
          ) {
            active = true;
          }

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.link} ${active ? styles.active : ""}`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* FOOTER LOGO */}
      <div className={styles.footerLogo}>
        <img
          src="/images/trifoley-logo.png"
          alt="trifoley"
          className={styles.footerImg}
        />
      </div>
    </aside>
  );
}
