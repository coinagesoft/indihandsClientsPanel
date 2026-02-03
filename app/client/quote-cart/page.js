"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./quoteCart.module.css";

export default function QuoteCartPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rfqSubmitted, setRfqSubmitted] = useState(false);

  // 🔍 image zoom
  const [zoomImg, setZoomImg] = useState(null);

  /* ================= FETCH CART ================= */
  const fetchCart = async () => {
    setLoading(true);
    const res = await fetch("/api/client/quote-cart");
    const data = await res.json();
    setCartItems(data.items || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ================= UPDATE QTY ================= */
  const updateQty = async (productId, action) => {
    await fetch("/api/client/quote-cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, action }),
    });
    fetchCart();
  };

  /* ================= DELETE ITEM ================= */
  const removeItem = async (productId) => {
    await fetch(`/api/client/quote-cart/${productId}`, {
      method: "DELETE",
    });
    fetchCart();
  };

  /* ================= SUBMIT RFQ ================= */
  const submitRFQ = async () => {
    const res = await fetch("/api/client/submit-rfq", {
      method: "POST",
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to submit RFQ");
      return;
    }

    setRfqSubmitted(true);
  };

  /* ================= TOTALS ================= */
  const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const totalAmount = cartItems.reduce(
    (sum, i) => sum + Number(i.price) * i.qty,
    0
  );

  if (loading) {
    return <div className="text-center mt-5">Loading cart...</div>;
  }

  /* ================= RFQ SUCCESS ================= */
  if (rfqSubmitted) {
    return (
      <div className={styles.centerWrapper}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✔</div>
          <h4 className={styles.successTitle}>
            RFQ Submitted Successfully
          </h4>
          <p className={styles.successText}>
            Thank you for your request. Our team will get back to you shortly.
          </p>

          <div className={styles.successActions}>
            <button
              className={styles.primaryBtn}
              onClick={() => router.push("/client/rfq-history")}
            >
              View RFQ History
            </button>

            <button
              className={styles.secondaryBtn}
              onClick={() => router.push("/client/product-catalog")}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.centerWrapper}>
        <div className={styles.emptyCard}>
          <h5>Your quote cart is empty</h5>
          <p>Add products to request a quotation.</p>

          <button
            className={styles.primaryBtn}
            onClick={() => router.push("/client/product-catalog")}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  /* ================= CART UI ================= */
  return (
    <div className={`${styles.dashboardWrapper} container-fluid py-5 `}>
      <div className={styles.dashboardCanvas} ></div>

      <h4 className={styles.pageTitle}>Quote Cart</h4>

      <div className="row mt-3">

        {/* CART TABLE */}
        <div className="col-lg-9">
          <div className={styles.cartBox}>
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Rate</th>
                  <th className="text-center">Qty</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {cartItems.map(item => {
                  const itemTotal = Number(item.price) * item.qty;

                  return (
                    <tr key={item.productId}>
                      {/* PRODUCT + IMAGE */}
                      <td>
                        <div className={styles.productCell}>
                          <img
                            src={item.featured_image}
                            alt={item.name}
                            className={styles.productImg}
                            onClick={() => setZoomImg(item.featured_image)}
                          />
                          <div className={styles.productName}>
                            {item.name}
                          </div>
                        </div>
                      </td>

                      <td>₹ {Number(item.price).toLocaleString()}</td>

                      <td className="text-center">
                        <div className={styles.qtyControl}>
                          <button
                            disabled={item.qty === 1}
                            onClick={() =>
                              updateQty(item.productId, "dec")
                            }
                          >
                            −
                          </button>
                          <span>{item.qty}</span>
                          <button
                            onClick={() =>
                              updateQty(item.productId, "inc")
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td>₹ {itemTotal.toLocaleString()}</td>

                      <td>
                        <button
                          className={styles.removeBtn}
                          onClick={() =>
                            removeItem(item.productId)
                          }
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="col-lg-3">
          <div className={styles.summaryBox}>
            <h6>Summary</h6>

            <div className={styles.summaryRow}>
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Total Amount</span>
              <span>₹ {totalAmount.toLocaleString()}</span>
            </div>

            <button
              className={styles.submitBtn}
              onClick={submitRFQ}
            >
              Submit RFQ
            </button>
          </div>
        </div>

      </div>

      {/* ================= IMAGE ZOOM MODAL ================= */}
      {zoomImg && (
        <div
          className={styles.zoomOverlay}
          onClick={() => setZoomImg(null)}
        >
          <div
            className={styles.zoomBox}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={zoomImg} alt="Zoom" />
            <button
              className={styles.zoomClose}
              onClick={() => setZoomImg(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
