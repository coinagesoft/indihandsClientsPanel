"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./productDetails.module.css";

export default function ProductDetailsPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    if (!id) return;

    setLoading(true);

    fetch(`/api/client/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data?.error) setProduct(data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  /* ================= ADD TO QUOTE ================= */
  const addToQuote = async () => {
    if (!id || qty < 1) return;

    setAdding(true);

    try {
const payload = {
  productId: Number(id),
  quantity: qty,
};

console.log("🟡 Add to Quote Payload:", payload);

      const res = await fetch("/api/client/quote-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(id),
          quantity: qty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to add product");
        return;
      }

      alert("Added to Quote ✅");
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setAdding(false);
    }
  };



  if (!product) {
    return <div className="text-center mt-5">Product not found</div>;
  }

  return (
   <div className={`${styles.dashboardWrapper} container-fluid   `}>
      <div className={styles.dashboardCanvas} ></div>


      {/* TITLE */}
      <div className="row mt-3">
        <div className="col-12">
          <h4 className={styles.titleMain}>
            {product.title}
            {product.subtitle && (
              <span className={styles.subTitle}>{product.subtitle}</span>
            )}
          </h4>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="row mt-2">
        <div className="col-12">
          <div className={styles.breadcrumbBox}>
            {product.breadcrumb.dashboard} &gt;{" "}
            {product.breadcrumb.catalog} &gt;{" "}
            {product.breadcrumb.catalogName} &gt;{" "}
            {product.breadcrumb.productName}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="row mt-4 g-4">

        {/* IMAGES */}
        <div className="col-lg-6">
          <div className="row g-3">
            {product.images.map((img, index) => (
              <div key={index} className="col-6">
                <div className={styles.imageCard}>
                  <img
                    src={img}
                    alt={product.title}
                    onError={e => (e.target.src = "/images/no-image.png")}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DETAILS */}
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
                  <p><b>Price:</b> ₹ {Number(product.price).toFixed(2)}</p>
                  <p><b>HSN:</b> {product.hsn || "-"}</p>
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
                  onChange={e => setQty(Number(e.target.value))}
                />
              </div>

              <button
                className={styles.addBtn}
                disabled={adding}
                onClick={addToQuote}
              >
                {adding ? "Adding..." : "Add to Quote"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
