"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./products.module.css";
import { useSearchParams } from "next/navigation";
import PageWrapper from "../../../components/common/wrapper";
import useAuthGuard from "../hooks/useAuthGuard";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import Footer from "../Footer/page";
import css from "../Footer/Footer.module.css";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

export default function ProductListingPage() {
  useAuthGuard();
  const router = useRouter();
  /* ================= STATE ================= */
  const searchParams = useSearchParams();
  const catalogId = searchParams.get("catalogId");
  const [products, setProducts] = useState([]);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [stock, setStock] = useState("");
  const [sort, setSort] = useState("latest");
  const [pageLoading, setPageLoading] = useState(true);   // initial only
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState({});
  const { cartCount, fetchCartCount } = useCart();



  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const token = localStorage.getItem("client_token");

    if (!token) {
      setProducts([]);
      setPageLoading(false);
      setLoading(false);
      setHasFetched(true);   // ✅ important
      return;
    }

    // page vs grid loader
    if (!hasFetched) {
      setPageLoading(true);
    } else {
      setLoading(true);
    }

    const params = new URLSearchParams();
    params.append("catalogId", catalogId);
    if (search) params.append("search", search);
    if (stock) params.append("stock", stock);
    if (sort) params.append("sort", sort);

    fetch(`/api/client/products?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        console.log("API response:", data); // ✅ correct

        setProducts(Array.isArray(data.products) ? data.products : []);
        setBreadcrumb(data.breadcrumb || {});
      })
      .catch(() => setProducts([]))
      .finally(() => {
        setPageLoading(false);
        setLoading(false);
        setHasFetched(true);   // ✅ mark fetch done
      });

    console.log("products list", products)

  }, [search, stock, sort, catalogId]);

  const handleLogout = async () => {
    try {
      await fetch("/api/client/auth/logout", { method: "POST" });
    } catch { }

    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    router.push("/login");
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  /* ================= UI ================= */
  return (
    <PageWrapper loading={pageLoading}>

      <div className={`${styles.dashboardWrapper} container-fluid   `}>

        <div className={styles.dashboardCanvas} ></div>

        {/* HEADER */}
        <div className={styles.headerBox}>

          {/* Breadcrumb Row */}
          <div className="row">

            <div className='col-10 breadcrumbBox'>

              <Link href="/client/dashboard" className="crumbLink">
                {breadcrumb.dashboard}
              </Link>

              {" > "}

              <Link href="/client/product-catalog" className="crumbLink">
                {breadcrumb.catalogName}
              </Link>

              {" > "}

              <span className='activeCrumb'>
                {breadcrumb.products}
              </span>

            </div>
            <div className="col-2">
              <div className="d-flex align-items-center justify-content-end gap-1">

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

          </div>

          {/* Title */}
          <div className="mt-1 ">
            <h4 className="pageTitle m-0">Products</h4>
            <p className={styles.pageSubTitle}>
              Art-led desk essentials for leadership spaces
            </p>
          </div>

        </div>

        {/* FILTER BAR */}
        <div className="d-flex justify-content-center ">

          <div className={`${styles.filterBar} row g-3 mt-0 mx-1 mt-2`}>

            <div className="col-xl-5 col-md-4 mt-0">
              {/* <label className={styles.label}>Search</label> */}
              <input
                className={`form-control ${styles.input}`}
                placeholder="Search by product name"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>



            <div className="col-xl-3 col-md-4 mt-0">
              {/* <label className={styles.label}>Availability</label> */}
              <select
                className={`form-select ${styles.select}`}
                value={stock}
                onChange={e => setStock(e.target.value)}
              >
                <option value="">Availability by stock</option>
                <option value="in">In Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>

            <div className="col-xl-4 col-md-4 mt-0">
              {/* <label className={styles.label}>Sort</label> */}
              <select
                className={`form-select ${styles.select}`}
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="latest">Sort by price</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
            </div>

          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className={styles.catalogBox}>

          <div className="row g-4 mt-4">

            {loading && (
              <div className="text-center text-muted">
                Loading products...
              </div>
            )}

            {!loading && hasFetched && products.length === 0 && (
              <div className="text-center text-muted">
                No products found
              </div>
            )}


            {!loading && products.map(p => (
              <div key={p.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                <Link href={`/client/products/${p.id}`} className={styles.productLink}>
                  <div className={styles.productCard}>

                    <div className={styles.productImageBox}>
                      <img
                        src={p.featured_image}
                        alt={p.product_name}
                        className={styles.productImage}
                        onError={e => (e.target.src = "/images/no-image.png")}
                      />
                    </div>

                 <p className={styles.productName}>
  {(() => {
    const [name, subName] = (p.product_name || "").split("::");

    const format = (text) =>
      text
        ?.trim()
        ?.toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
      <>
        <span className={styles.mainName}>{format(name)}</span><br></br>
        {subName && (
          <span className={styles.subName}>{format(subName)}</span>
        )}
      </>
    );
  })()}
</p>

                    <p className={styles.stockText}>
                      {p.stock_qty > 0 ? (
                        <span className={styles.inStock}>
                          In stock ({p.stock_qty})
                        </span>
                      ) : (
                        <span className={styles.outOfStock}>
                          Out of stock
                        </span>
                      )}
                    </p>


                    <div className={styles.bottomRow}>
                      <span className={styles.price}>
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(p.final_price)}
                      </span>
                      <button
                        className={styles.addBtn}

                      >
                        Description
                      </button>
                    </div>

                  </div>
                </Link>
              </div>
            ))}

          </div>
        </div>

        <footer className={`${css.productListing_Footer} `}>

          <div className={css.designLayer}></div>

          <img
            src="/images/trilogo.png"
            alt="IndiHands"
            className={css.logo}
          />

          <div className={css.text}>
            ©2026 | indiHands | www.indihands.com
          </div>

        </footer>

      </div>

    </PageWrapper>
  );
}
