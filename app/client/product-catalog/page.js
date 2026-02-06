"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./productCatalog.module.css";

export default function ProductCatalogPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch("/api/client/catalogs")
    .then(res => res.json())
    .then(data => {
      // 🔐 always normalize to array
      setCategories(Array.isArray(data) ? data : data.data || []);
      console.log("data",data)
    })
    .catch(err => {
      console.error("Catalog fetch error:", err);
      setCategories([]);
    })
    .finally(() => {
      setLoading(false); // ✅ stop loader
    });
}, []);



  return (
  <div className={`${styles.dashboardWrapper} container-fluid   `}>
      <div className={styles.dashboardCanvas} ></div>
      {/* TITLE */}
    
          <h4 className='pageTitle'>Product Catalog</h4>
     

   

    {/* CATALOG GRID */}
<div className="row g-4 mt-1">
  {!loading && categories.length === 0 ? (
    <div className="col-12 text-center mt-4">
      No catalogs available
    </div>
  ) : (
    categories.map(cat => (
      <div key={cat.id} className="col-xl-4 col-lg-4 col-md-6">
        <div className={`${styles.cardBox} p-3 h-100`}>

          {/* IMAGE PLACEHOLDER */}
<img
  src={cat.image}
  alt={cat.title}
  className={styles.imageBox}
/>



          {/* BADGE */}
        

          {/* CONTENT */}
          <h6 className={styles.cardTitle}>{cat.title}</h6>
          <p className={styles.cardDesc}>{cat.desc}</p>

          {/* CTA */}
          <Link
            href={`/client/products?catalogId=${cat.id}`}
            className={`${styles.viewBtnLink} d-flex align-items-center justify-content-center gap-1`}
          >
            View Products
            <i className="ri-arrow-right-line"></i>
          </Link>

        </div>
      </div>
    ))
  )}
</div>

    </div>
  );
}
