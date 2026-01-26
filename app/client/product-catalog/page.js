"use client";
import Link from "next/link";
import styles from "./productCatalog.module.css";

export default function ProductCatalogPage() {
  // Dummy categories (API later)
  const categories = [
    {
      title: "indiHands—The Stationery Edition",
      desc: "Art-led desk essentials for thoughtful gifting.",
    },
    {
      title: "The Thoughtful Edition (Up to ₹1,000)",
      desc: "Gifts that feel personal and refined.",
    },
    {
      title: "The Executive Edition (₹1,000 — ₹2,000)",
      desc: "Premium gifts for corporate moments.",
    },
    {
      title: "The Signature Edition (₹2,000 — ₹5,000)",
      desc: "Distinctive gifts to stand out.",
    },
    {
      title: "The Prestige Edition (₹5,000 — ₹8,000)",
      desc: "Impressive gifting for senior leadership.",
    },
    {
      title: "The Legacy Edition (₹8,000 & Above)",
      desc: "Heirloom-level gifting experiences.",
    },
  ];

  return (
    <div className="container-fluid">
      <div className="row mt-2">
        <div className="col-12">
          <h3 className={styles.pageTitle}>Product Catalog</h3>
        </div>
      </div>

      {/* ✅ Cards Grid */}
      <div className="row g-4 mt-2">
        {categories.map((cat, index) => (
          <div key={index} className="col-lg-4 col-md-6 col-sm-12">
            <div className={`${styles.cardBox} p-3`}>
              {/* Image box placeholder */}
              <div className={styles.imageBox}></div>

              <h6 className={styles.cardTitle}>{cat.title}</h6>
              <p className={styles.cardDesc}>{cat.desc}</p>

            <Link
  href={`/client/products?category=${encodeURIComponent(cat.title)}`}
  className={styles.viewBtnLink}
>
  View Products
</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
