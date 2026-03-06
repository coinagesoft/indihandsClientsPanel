"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./productCatalog.module.css";
import PageWrapper from "../../../components/common/wrapper";
import useAuthGuard from "../hooks/useAuthGuard";
import Footer from "../Footer/page";

export default function ProductCatalogPage() {
    useAuthGuard();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/catalogs")
      .then(res => res.json())
      .then(data => {
        // 🔐 always normalize to array
        setCategories(Array.isArray(data) ? data : data.data || []);
        console.log("data", data)
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
  <PageWrapper loading={loading}>
  <div className={`${styles.dashboardWrapper} container-fluid`}>

    {/* BACKGROUND CANVAS */}
    <div className={styles.dashboardCanvas}></div>

    {/* PAGE CONTENT */}
    <div className={styles.dashboardContent}>

      <h4 className="pageTitle">Product Catalog</h4>

      <div className="row g-3 mt-1">
        {!loading && categories.length === 0 ? (
          <div className="col-12 text-center mt-4">
            No catalogs available
          </div>
        ) : (
          [...categories].reverse().map(cat => (
            <div key={cat.id} className="col-xl-4 col-lg-4 col-md-6 d-flex">

              <div className={styles.catalogCard}>

                <div className={styles.catalogImgWrap}>
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className={styles.catalogImg}
                  />
                </div>

                <div className={styles.catalogContent}>
                  <h6 className={styles.catalogTitle}>{cat.title}</h6>

                  <div className={styles.catalogBottom}>
                    <p className={styles.catalogDesc}>{cat.desc}</p>

                    <Link
                      href={`/client/products?catalogId=${cat.id}`}
                      className={styles.catalogBtn}
                    >
                      View Products
                    </Link>
                  </div>
                </div>

              </div>

            </div>
          ))
        )}
      </div>

    </div>

  <Footer  variant="type2"/>
  </div>
</PageWrapper>
  );
}
