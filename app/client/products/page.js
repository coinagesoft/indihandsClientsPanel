"use client";
import Link from "next/link";
import styles from "./products.module.css";
import { useSearchParams } from "next/navigation";

export default function ProductListingPage() {
    const searchParams = useSearchParams();
const category = searchParams.get("category");

  // Dummy products (API later)
  const products = [
    { id: 1, name: "Kalpavruksha: Handmade A5 Size Jute Diary", price: "₹ 1,343.00" },
    { id: 2, name: "Khaki: Hand-Made Cotton Silk A5 Size Folder", price: "₹ 1,119.00" },
    { id: 3, name: "Dainandini: The Handmade Paper Journal", price: "₹ 1,007.00" },
    { id: 4, name: "Handmade Paper Bag", price: "₹ 223.00" },
    { id: 5, name: "Pierre Cardin Roller Pen", price: "₹ 799.00" },
    { id: 6, name: "Carmin: Premium Leatherette Folder", price: "₹ 1,399.00" },
    { id: 7, name: "Pakshi: The Hand-Painted Kalamkari Folder", price: "₹ 1,299.00" },
    { id: 8, name: "Shaniwar Wada, Pune: Handmade Paper Journal", price: "₹ 849.00" },
  ];

  return (
    <div className="container-fluid">
      {/* ✅ Top Header Row */}
      <div className="row align-items-center mt-2">
        <div className="col-lg-6 col-md-12">
<h4 className={styles.pageTitle}>
  {category ? category : "Products"}
</h4>
          <p className={styles.pageSubTitle}>
            Art-led desk essential for leadership spaces
          </p>
        </div>

        {/* Right Filters */}
        <div className="col-lg-6 col-md-12">
          <div className={`row g-3 justify-content-end ${styles.topFiltersRow}`}>
            <div className="col-md-5 col-sm-6">
              <select className={`form-select ${styles.selectBox}`}>
                <option>Search Product</option>
                <option>Diary</option>
                <option>Folder</option>
                <option>Pen</option>
              </select>
            </div>

            <div className="col-md-5 col-sm-6">
              <select className={`form-select ${styles.selectBox}`}>
                <option>Sort</option>
                <option>Price Low to High</option>
                <option>Price High to Low</option>
                <option>Latest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Search + Stock Filter */}
      <div className="row mt-3 g-3">
        <div className="col-lg-8 col-md-12">
          <input
            type="text"
            placeholder="Search Product"
            className={`form-control ${styles.searchInput}`}
          />
        </div>

        <div className="col-lg-4 col-md-12">
          <select className={`form-select ${styles.selectBox}`}>
            <option>Stock Availability</option>
            <option>In Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>

      {/* ✅ Products Grid */}
      <div className="row mt-4 g-4">
      {products.map((p) => (
  <div key={p.id} className="col-lg-3 col-md-4 col-sm-6">
    <Link href={`/client/products/${p.id}`} className={styles.productLink}>
      <div className={`${styles.productCard} p-2`}>
        <div className={styles.productImageBox}></div>

        <p className={styles.productName}>{p.name}</p>

        <div className={styles.bottomRow}>
          <span className={styles.price}>{p.price}</span>

          <button
            className={styles.addBtn}
            onClick={(e) => {
              e.preventDefault(); // ✅ stop opening details page
              alert("Added to Quote ✅");
            }}
          >
            Add to Quote
          </button>
        </div>
      </div>
    </Link>
  </div>
))}

      </div>
    </div>
  );
}
