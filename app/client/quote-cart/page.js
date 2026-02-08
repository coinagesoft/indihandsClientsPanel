"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./quoteCart.module.css";
import PageWrapper from "../../../components/common/wrapper";
import Toast from "../../../components/common/Toast";

export default function QuoteCartPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rfqSubmitted, setRfqSubmitted] = useState(false);

  // 🔍 image zoom
  const [zoomImg, setZoomImg] = useState(null);
const [toast, setToast] = useState({ message: "", type: "" });
const toastTimer = useRef(null);

const showToast = (message, type = "success") => {
  if (toastTimer.current) clearTimeout(toastTimer.current);

  setToast({ message, type });

  toastTimer.current = setTimeout(() => {
    setToast({ message: "", type: "" });
  }, 3000);
};

/* ================= FETCH CART ================= */
const fetchCart = async () => {
  setLoading(true);

  const token = localStorage.getItem("client_token");
  if (!token) {
    console.error("Token missing");
    setLoading(false);
    return;
  }

  const res = await fetch("/api/client/quote-cart", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  setCartItems(data.items || []);
  setLoading(false);
};

useEffect(() => {
  fetchCart();
}, []);


/* ================= UPDATE QTY ================= */
const updateQty = async (productId, action) => {
  const token = localStorage.getItem("client_token");
  if (!token) {
    showToast("Unauthorized", "error");
    return;
  }

  const item = cartItems.find(i => i.productId === productId);
  if (!item) return;

  // 🚫 Prevent increasing beyond stock
  if (action === "inc" && item.qty >= item.stock_qty) {
    showToast(
      `Only ${item.stock_qty} items available in stock`,
      "warning"
    );
    return;
  }

  // 🚫 Prevent decreasing below 1 (extra safety)
  if (action === "dec" && item.qty <= 1) {
    return;
  }

  const res = await fetch("/api/client/quote-cart", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, action }),
  });

  if (!res.ok) {
    showToast("Stock limit reached", "error");
    return;
  }

  fetchCart();
};



/* ================= DELETE ITEM ================= */
const removeItem = async (productId) => {
  const token = localStorage.getItem("client_token");
  if (!token) {
    showToast("Unauthorized", "error");
    return;
  }

  const res = await fetch(`/api/client/quote-cart/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    showToast("Failed to remove item", "error");
    return;
  }

  showToast("Item removed from quote cart", "success");
  fetchCart();
};



  /* ================= SUBMIT RFQ ================= */
const submitRFQ = async () => {
  const token = localStorage.getItem("client_token");
  if (!token) {
   showToast("Unauthorized", "error");
    return;
  }

  const res = await fetch("/api/client/submit-rfq", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // 🔥 REQUIRED
    },
  });

  const data = await res.json();

  if (!res.ok) {
   showToast(data.error || "Failed to submit RFQ", "error");
    return;
  }
  showToast("RFQ submitted successfully 🎉", "success");
  setRfqSubmitted(true);
};


  /* ================= TOTALS ================= */
  const totalItems = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const totalAmount = cartItems.reduce(
    (sum, i) => sum + Number(i.price) * i.qty,
    0
  );

 

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
const maskAmountWithStars = (amount) => {
  if (amount === null || amount === undefined) return "";
  const digits = String(Math.floor(amount)).length;
  return "*".repeat(digits);
};




  /* ================= CART UI ================= */
  return (
    <>
    <Toast
  message={toast.message}
  type={toast.type}
  onClose={() => setToast({ message: "", type: "" })}
/>

      <PageWrapper loading={loading}>
    <div className={`${styles.dashboardWrapper} container-fluid  `}>
      <div className={styles.dashboardCanvas} ></div>

      <h4 className='pageTitle'>Quote Cart</h4>

      <div className="row mt-3">

        {/* CART TABLE */}
        <div className="col-lg-9">
          <div className={styles.cartBox}>
            <table className="table-custom mb-0">
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
  <span>₹ {maskAmountWithStars(totalAmount)}</span>
</div>


            <button
              className={styles.submitBtn}
              onClick={submitRFQ}
            >
              Request for Proposal
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
    </PageWrapper>
  </>
  );
}
