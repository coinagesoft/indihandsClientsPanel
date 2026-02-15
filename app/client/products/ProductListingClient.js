"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./products.module.css";
import { useSearchParams } from "next/navigation";
import PageWrapper from "../../../components/common/wrapper";

export default function ProductListingPage() {

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
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => {
        setPageLoading(false);
        setLoading(false);
        setHasFetched(true);   // ✅ mark fetch done
      });

  }, [search, stock, sort, catalogId]);



  /* ================= UI ================= */
  return (
    <PageWrapper loading={pageLoading}>

      <div className={`${styles.dashboardWrapper} container-fluid   `}>
        <div className={styles.dashboardCanvas} ></div>

        {/* HEADER */}
        <div className="row mt-2">
          <div className="col-12">
            <h4 className='pageTitle'>Products</h4>
            <p className={styles.pageSubTitle}>
              Art-led desk essentials for leadership spaces
            </p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className={`${styles.filterBar} row g-4 mt-3 mx-1`}>

          <div className="col-xl-5 col-md-6">
            <label className={styles.label}>Search</label>
            <input
              className={`form-control ${styles.input}`}
              placeholder="Type product name"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

      

          <div className="col-xl-3 col-md-6">
            <label className={styles.label}>Availability</label>
            <select
              className={`form-select ${styles.select}`}
              value={stock}
              onChange={e => setStock(e.target.value)}
            >
              <option value="">All</option>
              <option value="in">In Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          <div className="col-xl-4 col-md-6">
            <label className={styles.label}>Sort</label>
            <select
              className={`form-select ${styles.select}`}
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="latest">Latest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

        </div>

        {/* PRODUCTS GRID */}
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

                  <p className={styles.productName}>{p.product_name}</p>

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
                      ₹ {Number(p.final_price).toFixed(2)}
                    </span>
                    <button
                      className={styles.addBtn}

                    >
                      Details
                    </button>
                  </div>

                </div>
              </Link>
            </div>
          ))}

        </div>
      </div>
    </PageWrapper>
  );
}
