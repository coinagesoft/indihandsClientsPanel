"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./productCatalog.module.css";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import PageWrapper from "../../../components/common/wrapper";
import useAuthGuard from "../hooks/useAuthGuard";
import Footer from "../Footer/page";
import { useCart } from "../../context/CartContext";

export default function ProductCatalogPage() {
  useAuthGuard();

  const { cartCount, fetchCartCount } = useCart();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await fetch("/api/client/auth/logout", { method: "POST" });
    } catch { }

    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    router.push("/login");
  };

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

 useEffect(() => {
    fetchCartCount();
  }, []);

  return (
    <PageWrapper loading={loading}>
      <div className={`${styles.dashboardWrapper} container-fluid`}>

        {/* BACKGROUND CANVAS */}
        <div className={styles.dashboardCanvas}></div>

        {/* PAGE CONTENT */}
        <div className={styles.dashboardContent}>

          <div className="d-flex justify-content-between">
            <h4 className="pageTitle mt-0">Product Catalog</h4>
            <div className="d-flex align-items-start gap-1">
          <button
  className='guideBtn'
  onClick={() => window.open("/indiHands_Client_Portal – User_Guide.pdf", "_blank")}
>
  User Guide
</button>
                      {/* LOGOUT */}
                      <button className="logoutBtn" onClick={handleLogout}>
                        Logout
                      </button>
          
                      <div
                        className="cartIconBox"
                        onClick={() => router.push("/client/quote-cart")}
                      >
                        <HiOutlineShoppingBag size={18} className="cartIcon" />
          
                        {cartCount > 0 && (
                          <span className="cartBadge">{cartCount}</span>
                        )}
                      </div>
          
                    </div>

          </div>
          <div className={styles.catalogGrid}>
            {!loading && categories.length === 0 ? (
              <div className="col-12 text-center mt-4">
                No catalogs available
              </div>
            ) : (
              [...categories].reverse().map(cat => (
                <div key={cat.id} className={styles.catalogItem}>
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

        <Footer variant="type2" />
      </div>
    </PageWrapper>
  );
}
