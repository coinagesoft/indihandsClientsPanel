"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import styles from "./productDetails.module.css";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [qty, setQty] = useState(1);

  const product = {
    id,
    title: "Shaniwar Wada, Pune",
    subtitle: "Handmade Paper Journal",
    breadcrumb:
      "Dashboard  >  Product Catalog  >  indiHands – The Stationery Edition  >  Shaniwar Wada Journal",
    description:
      "This premium handmade paper diary honours the timeless grandeur of Shaniwar Wada, built in 1732 as the seat of the Peshwas. Crafted with artisanal care, its textured pages echo the strength and elegance of Pune’s regal legacy. Each page invites reflection, creativity, and permanence — making it ideal for thoughtful gifting or personal journaling.",
    details: {
      code: "1906",
      size: '6" W × 9" H',
      cost: "₹ 849.00",
      weight: "625 GM",
      hsn: "48021010",
    },
    images: [
      "/images/sample-product-1.jpg",
      "/images/sample-product-2.jpg",
      "/images/sample-product-3.jpg",
      "/images/sample-product-4.jpg",
    ],
  };

  return (
    <div className="container-fluid">
      {/* ===== TITLE ===== */}
      <div className="row mt-3">
        <div className="col-12">
          <h4 className={styles.titleMain}>
            {product.title}
            <span className={styles.subTitle}>{product.subtitle}</span>
          </h4>
        </div>
      </div>

      {/* ===== BREADCRUMB ===== */}
      <div className="row mt-2">
        <div className="col-12">
          <div className={styles.breadcrumbBox}>
            {product.breadcrumb}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="row mt-4 g-4">
        {/* LEFT : IMAGES */}
        <div className="col-lg-6">
          <div className="row g-3">
            {product.images.map((img, index) => (
              <div key={index} className="col-6">
                <div className={styles.imageCard}>
                  <img src={img} alt="product" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT : DETAILS */}
        <div className="col-lg-6">
          <div className={styles.rightBox}>
            {/* DESCRIPTION */}
            <div className={styles.section}>
              <h6 className={styles.sectionTitle}>Description</h6>
              <p className={styles.descText}>{product.description}</p>
            </div>

            {/* SPECS */}
            <div className={styles.section}>
              <h6 className={styles.sectionTitle}>Product Details</h6>

              <div className="row">
                <div className="col-6">
                  <p><b>Code:</b> {product.details.code}</p>
                  <p><b>Size:</b> {product.details.size}</p>
                  <p><b>Weight:</b> {product.details.weight}</p>
                </div>

                <div className="col-6">
                  <p><b>Price:</b> {product.details.cost}</p>
                  <p><b>HSN:</b> {product.details.hsn}</p>
                </div>
              </div>
            </div>

            {/* ACTION */}
            <div className={styles.actionBox}>
              <div className={styles.qtyBox}>
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                />
              </div>

              <button
                className={styles.addBtn}
                onClick={() => alert(`Added Qty: ${qty}`)}
              >
                Add to Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
