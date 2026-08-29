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
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
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

  const handleSearch = async (value) => {
    setSearch(value);
    if (!value) { setResults([]); return; }
    try {
      const token = localStorage.getItem("client_token");
      const res = await fetch(`/api/client/globalFilter?search=${value}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResults(data.products || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  useEffect(() => {
    fetch("/api/client/catalogs")
      .then((res) => res.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : data.data || []);
      })
      .catch((err) => {
        console.error("Catalog fetch error:", err);
        setCategories([]);
      })
      .finally(() => setLoading(false));
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

          {/* ── TOP BAR ── */}
          <div className="d-flex align-items-center">

            {/* LEFT */}
            <div style={{ minWidth: "220px" }}>
              <h4 className="pageTitle mt-0">Product Catalog</h4>
            </div>

            {/* CENTER — search */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div className="global-search">
                <input
                  type="text"
                  placeholder="Search products (name / code)..."
                  className="global-search-input"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {search && (
                  <span
                    className="global-search-clear"
                    onClick={() => { setSearch(""); setResults([]); }}
                  >
                    ×
                  </span>
                )}
                {results.length > 0 && (
                  <div className="global-search-dropdown">
                    {results.map((item) => (
                      <div
                        key={item.id}
                        className="global-search-item"
                        onClick={() => {
                          setResults([]);
                          setSearch("");
                          router.push(`/client/products/${item.id}`);
                        }}
                      >
                        <div className="global-search-name">{item.product_name}</div>
                        <div className="global-search-code">Code: {item.barcode || "-"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — actions */}
            <div
              className="d-flex align-items-center gap-2"
              style={{ minWidth: "250px", justifyContent: "flex-end" }}
            >
              <button
                className="guideBtn"
                onClick={() =>
                  window.open("/indiHands_Client_Portal – User_Guide.pdf", "_blank")
                }
              >
                User Guide
              </button>
              <button className="logoutBtn" onClick={handleLogout}>
                Logout
              </button>
              <div
                className="cartIconBox"
                onClick={() => router.push("/client/quote-cart")}
              >
                <HiOutlineShoppingBag size={18} className="cartIcon" />
                {cartCount > 0 && <span className="cartBadge">{cartCount}</span>}
              </div>
            </div>
          </div>

          {/* ── CATALOG GRID ── */}
          <div className={styles.catalogGrid}>
            {!loading && categories.length === 0 ? (
              <div className="col-12 text-center mt-4">No catalogs available</div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className={styles.catalogItem}>
                  <Link
                    href={`/client/products?catalogId=${cat.id}`}
                    className={styles.catalogCard}
                    style={{
                      backgroundImage: `url("${encodeURI(cat.image)}")`,
                    }}
                  >
                    {/* Text — bottom-left, avoids right decorative border strip */}
                    <div className={styles.catalogContent}>
                      <h6 className={styles.catalogTitle}>{cat.title}</h6>
                      <div className={styles.catalogBottom}>
                        <p className={styles.catalogDesc}>{cat.desc}</p>
                        <span className={styles.catalogBtn}>View Products</span>
                      </div>
                    </div>
                  </Link>
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