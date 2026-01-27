"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./products.module.css";
import { useSearchParams } from "next/navigation";

export default function ProductListingPage() {
const searchParams = useSearchParams();
  const catalogId = searchParams.get("catalogId");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(catalogId || "");
  const [stock, setStock] = useState("");
  const [sort, setSort] = useState("latest");

  /* FETCH CATEGORIES */
  useEffect(() => {
    fetch("/api/client/categories")
      .then(res => res.json())
      .then(setCategories);
  }, []);

  /* FETCH PRODUCTS */
  useEffect(() => {
    const params = new URLSearchParams({
      search,
      catalogId: category,
      stock,
      sort,
    });

    fetch(`/api/client/products?${params.toString()}`)
      .then(res => res.json())
      .then(setProducts);
  }, [search, category, stock, sort]);

  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div className="row mt-2">
        <div className="col-md-6">
          <h4 className={styles.pageTitle}>Products</h4>
          <p className={styles.pageSubTitle}>
            Art-led desk essentials for leadership spaces
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className={`${styles.filterBar} row g-3 mt-3`}>

        {/* SEARCH */}
        <div className="col-lg-4 col-md-6">
          <label className={styles.label}>Search Product</label>
          <input
            className={`form-control ${styles.input}`}
            placeholder="Type product name"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* CATEGORY */}
        <div className="col-lg-3 col-md-6">
          <label className={styles.label}>Category</label>
          <select
            className={`form-select ${styles.select}`}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* STOCK */}
        <div className="col-lg-3 col-md-6">
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

        {/* SORT */}
        <div className="col-lg-2 col-md-6">
          <label className={styles.label}>Sort By</label>
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
      <div className="row mt-4 g-4">
        {products.length === 0 ? (
          <div className="text-center">No products found</div>
        ) : (
          products.map(p => (
            <div key={p.id} className="col-lg-3 col-md-4 col-sm-6">
              <Link href={`/client/products/${p.id}`} className={styles.productLink}>
                <div className={styles.productCard}>
                  <div className={styles.productImageBox}></div>

                  <p className={styles.productName}>{p.product_name}</p>

                  <div className={styles.bottomRow}>
                    <span className={styles.price}>
                      ₹ {Number(p.base_price).toFixed(2)}
                    </span>

                    <button
                      className={styles.addBtn}
                      onClick={e => {
                        e.preventDefault();
                        alert("Added to Quote ✅");
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
