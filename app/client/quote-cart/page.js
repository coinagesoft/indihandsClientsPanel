"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./quoteCart.module.css";
import PageWrapper from "../../../components/common/wrapper";
import Toast from "../../../components/common/Toast";

export default function QuoteCartPage() {
  const router = useRouter();
const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rfqSubmitted, setRfqSubmitted] = useState(false);
const [client, setClient] = useState({
  name: "",
  phone: "",
  email: ""
});

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
  if (submitting) return; // prevent double click

  const token = localStorage.getItem("client_token");
  if (!token) {
    showToast("Unauthorized", "error");
    return;
  }

  setSubmitting(true); // 🔥 start loading

  try {
    const res = await fetch("/api/client/submit-rfq", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        clientName: client.name,
        clientPhone: client.phone,
        clientEmail: client.email,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || "Failed to submit RFQ", "error");
      setSubmitting(false);
      return;
    }

    showToast(
      "RFQ submitted successfully. Confirmation email sent to your email 📧",
      "success"
    );

    setRfqSubmitted(true);
  } catch (err) {
    showToast("Network error", "error");
    setSubmitting(false);
  }
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
<p className={styles.successEmail}>
   A confirmation email has been sent to your email address.
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
        <th>
          Est. Total
          <span className={styles.infoInline}>*</span>
        </th>
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
              {/* 👇 FOOTNOTE HERE */}
  <div className={styles.tableNote}>
    *Indicative amount only. Final quotation will be shared after RFQ review.
  </div>
          </div>
        </div>

{/* ================= SUMMARY ================= */}
<div className="col-lg-3">
  <div className={`${styles.summaryCard} card`}>

    {/* TITLE */}
    <div className={styles.summaryHeader}>
      <h6 className={styles.summaryTitle}>Summary</h6>
    </div>

    {/* TOTALS */}
    <div className={styles.summaryStats}>
      <div className={styles.statRow}>
        <span>Total Items</span>
        <strong>{totalItems}</strong>
      </div>

      <div className={styles.statRow}>
        <span>Total Amount</span>
        <strong>₹ {maskAmountWithStars(totalAmount)}</strong>
      </div>
    </div>

    {/* CLIENT BLOCK */}
    <div className={styles.clientSection}>
      <div className={styles.sectionLabel}>Client Details</div>

      <input
        className={`form-control ${styles.input}`}
        placeholder="Client Name"
        value={client.name}
        onChange={(e) =>
          setClient({ ...client, name: e.target.value })
        }
      />

      <input
        className={`form-control ${styles.input}`}
        placeholder="Phone Number"
        value={client.phone}
        onChange={(e) =>
          setClient({ ...client, phone: e.target.value })
        }
      />

      <input
        className={`form-control ${styles.input}`}
        placeholder="Email ID"
        value={client.email}
        onChange={(e) =>
          setClient({ ...client, email: e.target.value })
        }
      />
    </div>

    {/* ACTION */}
   <button
  className={`btn-primary w-100 ${styles.submitBtn}`}
  onClick={submitRFQ}
  disabled={submitting}
>
  {submitting ? (
    <>
      <span className={styles.spinner}></span>
    Submitting RFQ...
    </>
  ) : (
    "Request for Proposal"
  )}
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
