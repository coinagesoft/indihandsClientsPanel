"use client";

import { useState } from "react";
import styles from "./productDetails.module.css";

import { useParams } from "next/navigation";

export default function ProductDetailsPage() {
  const { id } = useParams();


  // dummy data (API later)
  const product = {
    id,
    title: "Shaniwar Wada, Pune:",
    subtitle: "Handmade Paper Journal",
    breadcrumb:
      "Dashboard  >  Product Catalog  >  indiHands-The Stationery Edition  >  Shaniwar Wada, Pune: Handmade Paper Journal",
    description:
      "This premium handmade paper diary honours the timeless grandeur of Shaniwar Wada, built in 1732 as the seat of the Peshwas. Once a centre of authority, artistry, and ceremony, its mighty gates and intricate carvings still speak of Maratha power and resilience despite the fire of 1828. Crafted with artisanal care, the diary’s handmade texture reflects the fort’s enduring strength, making it a treasured canvas for your own ideas. Each page turns like a chapter of history, blending heritage with creativity. Let this diary inspire you to record thoughts with the same permanence as Pune’s regal legacy.",
    details: {
      code: "1906",
      size: '6" W X 9" H',
      cost: "Rs. 849.00",
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

  const [qty, setQty] = useState(1);

  return (
    <div className="container-fluid">
      {/* ✅ Title */}
      <div className="row mt-3">
        <div className="col-12">
          <h4 className={styles.titleMain}>
            {product.title}
            <br />
            {product.subtitle}
          </h4>
        </div>
      </div>

      {/* ✅ Breadcrumb */}
      <div className="row mt-2">
        <div className="col-12">
          <div className={styles.breadcrumbBox}>
            <p className={styles.breadcrumbText}>{product.breadcrumb}</p>
          </div>
        </div>
      </div>

      {/* ✅ Content Row */}
      <div className="row mt-4">
        {/* LEFT IMAGES */}
        <div className="col-lg-6 col-md-12">
          <div className="row g-3">
            {product.images.map((img, index) => (
              <div key={index} className="col-6">
                <div className={styles.imageCard}>
                  <img src={img} alt="product" className={styles.productImg} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT DETAILS */}
        <div className="col-lg-6 col-md-12">
          <div className={styles.rightBox}>
            <p className={styles.descText}>
              <span className={styles.redLabel}>Description:</span>{" "}
              {product.description}
            </p>

            <div className={styles.detailsBox}>
              <p className={styles.redLabel}>Details:</p>

              <p className={styles.detailsText}>
                Code: {product.details.code} | Size: {product.details.size} |
                Cost: {product.details.cost}
              </p>

              <p className={styles.detailsText}>
                Weight: {product.details.weight} | HSN: {product.details.hsn}
              </p>
            </div>

            {/* ✅ Quantity */}
            <div className={styles.qtyRow}>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className={styles.qtyInput}
              />
            </div>

            {/* ✅ Button */}
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
  );
}
