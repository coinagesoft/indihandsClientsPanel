"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./productDetails.module.css";
import PageWrapper from "../../../../components/common/wrapper";
import Toast from "../../../../components/common/Toast";
import useAuthGuard from "../../hooks/useAuthGuard";


export default function ProductDetailsPage() {
    //  useAuthGuard();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [cartQtyMap, setCartQtyMap] = useState({});

  const toastTimer = useRef(null);

  const showToast = (message, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);

    setToast({ message, type });

    toastTimer.current = setTimeout(() => {
      setToast({ message: "", type: "" });
    }, 3000);
  };



  /* ================= MASONRY DUMMY IMAGES ================= */
  const images = [
    "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=900&q=80", // landscape
    "https://images.unsplash.com/photo-1519664824562-b4bc73f9795a?q=80&w=327&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // portrait
    "https://images.unsplash.com/photo-1712232971357-fd8f4b5e313c?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // medium
    "https://images.unsplash.com/photo-1647437992378-f47b93029d15?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1711871124431-836d92aed0d9?q=80&w=478&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // tall
    "https://images.unsplash.com/photo-1647107349002-85e66a39abd3?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  ];


useEffect(() => {
  const token = localStorage.getItem("client_token");
  if (!token || !id) return;

  fetch("/api/client/quote-cart", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      const map = {};
      data?.items?.forEach(item => {
        map[item.productId] = item.qty;
      });
      setCartQtyMap(map);
    });
}, [id]); // 🔥 VERY IMPORTANT

useEffect(() => {
  if (!product) return;

  const alreadyInCart = cartQtyMap[id] || 0;
  const remainingStock = product.stock_qty - alreadyInCart;

  if (remainingStock <= 0) {
    setQty(1); // or 0
  } else if (qty > remainingStock) {
    setQty(remainingStock);
  }
}, [cartQtyMap, product, id]);



  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("client_token");
    if (!token) {
      setLoading(false);
      setHasFetched(true);
      return;
    }

    setLoading(true);

    fetch(`/api/client/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log("products", data)
        if (!data?.error) {
          setProduct(data);
        } else {
          setProduct(null);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => {
        setLoading(false);
        setHasFetched(true); // ✅ mark fetch completed
      });
  }, [id]);

  /* ================= ADD TO QUOTE ================= */
  const addToQuote = async () => {
    if (!id || qty < 1) return;


    
    if (qty > product.stock_qty) {
      showToast("Requested quantity exceeds stock", "warning");
      return;
    }
    const token = localStorage.getItem("client_token");
    if (!token) {
      showToast("Please login to continue", "warning");
      return;
    }

    setAdding(true);

    try {
      const res = await fetch("/api/client/quote-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: Number(id),
          quantity: qty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data?.error || "Failed to add product", "error");
        return;
      }

      showToast("Added to Quote successfully", "success");
    } finally {
      setAdding(false);
    }
  };

//   const addToQuote = async () => {

//       if (qty === "" || qty === null || qty === undefined) {
//     showToast("Please enter quantity", "warning");
//     return;
//   }

//   // 🚫 invalid quantity
//   if (Number(qty) < 1) {
//     showToast("Quantity must be at least 1", "warning");
//     return;
//   }
//   if (!id || qty < 1) return;

//   const alreadyInCart = cartQtyMap[id] || 0;
//   const remainingStock = product.stock_qty - alreadyInCart;

//   // 🚫 already fully consumed
//   if (remainingStock <= 0) {
//     showToast(
//       "This product is already fully added to your quote",
//       "warning"
//     );
//     return;
//   }

//   // 🚫 user asking more than remaining
//   if (qty > remainingStock) {
//     showToast(
//       `Only ${remainingStock} item(s) available (already in quote)`,
//       "warning"
//     );
//     return;
//   }

//   const token = localStorage.getItem("client_token");
//   if (!token) {
//     showToast("Please login to continue", "warning");
//     return;
//   }

//   setAdding(true);

//   try {
//     const res = await fetch("/api/client/quote-cart", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         productId: Number(id),
//         quantity: qty,
//       }),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       showToast(data?.error || "Failed to add product", "error");
//       return;
//     }

//     // ✅ immediately reflect in UI cart state
//     setCartQtyMap(prev => ({
//       ...prev,
//       [id]: alreadyInCart + qty,
//     }));

//     showToast("Added to Quote successfully", "success");
//   } finally {
//     setAdding(false);
//   }
// };



  if (loading) {
    return <PageWrapper loading={true} />;
  }

  // 2️⃣ API finished, product not found
  if (hasFetched && !product) {
    return (
      <PageWrapper loading={false}>
        <div className="text-center mt-5">
          <h5>Product not found</h5>
          <p className="text-muted">
            This product may be unavailable or removed.
          </p>
        </div>
      </PageWrapper>
    );
  }



  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />

      <PageWrapper loading={loading}>
        <div className={`${styles.dashboardWrapper} container-fluid`}>
          <div className={styles.dashboardCanvas}></div>

          {/* TITLE */}
          <div className="row mt-3">
            <div className="col-12">
              <h4 className="pageTitle">
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

            {/* IMAGES – MIXED HEIGHT MASONRY */}
            <div className="col-lg-6">
              <div className={styles.masonry}>
                {product.images.map((img, index) => (
                  <div key={index} className={styles.masonryItem}>
                    <img
                      src={img}
                      alt={product.title}
                      loading="lazy"
                      onClick={() => setPreviewImg(img)}
                    />
                  </div>
                ))}
              </div>

            </div>

            {/* DETAILS */}
            <div className="col-lg-6">
              <div className={styles.rightBox}>

                <div className={styles.section}>
                  <h6 className={styles.sectionTitle}>Description</h6>
                  <p className={styles.descText}>{product.description}</p>
                </div>

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
                      {/* ✅ STOCK */}
                      <p>
                        <b>Stock:</b>{" "}
                        {product.stock_qty > 0 ? (
                          <span className={styles.inStock}>
                            {product.stock_qty} Available
                          </span>
                        ) : (
                          <span className={styles.outOfStock}>Out of stock</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.actionBox}>
                  <div className={styles.qtyBox}>
                    <label className="me-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      max={product.stock_qty}
                      value={qty ?? ""}
onChange={(e) => {
  const raw = e.target.value;

  if (raw === "") {
    setQty("");
    return;
  }

  const value = Number(raw);

  if (isNaN(value)) return;

  if (value < 1) {
    setQty(1);
    return;
  }

  if (value > (product?.stock_qty ?? 0)) {
    showToast(
      "Requested quantity exceeds available stock",
      "warning"
    );
    setQty(product?.stock_qty ?? 1);
    return;
  }

  setQty(value);
}}
                    />


                  </div>

                  <button
                    className={styles.addBtn}
                    disabled={adding || product.stock_qty === 0}
                    onClick={addToQuote}
                  >
                    {product.stock_qty === 0
                      ? "Out of Stock"
                      : adding
                        ? "Adding..."
                        : "Add to Quote"}
                  </button>

                </div>

              </div>
            </div>
          </div>
        </div>
        {previewImg && (
          <div
            className={styles.imageOverlay}
            onClick={() => setPreviewImg(null)}
          >
            <div
              className={styles.imagePopup}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.closeBtn}
                onClick={() => setPreviewImg(null)}
              >
                ×
              </button>

              <img src={previewImg} alt="Preview" />
            </div>
          </div>
        )}

      </PageWrapper>
    </>
  );
}
