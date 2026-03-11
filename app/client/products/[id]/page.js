"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./productDetails.module.css";
import PageWrapper from "../../../../components/common/wrapper";
import Toast from "../../../../components/common/Toast";
import useAuthGuard from "../../hooks/useAuthGuard";
import css from "../../Footer/Footer.module.css";


export default function ProductDetailsPage() {

  const { id } = useParams();
  useAuthGuard();
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


  const addToQuote = async () => {
    if (!id || qty < 1) return;

    const alreadyInCart = cartQtyMap[id] || 0;
    const remainingStock = product.stock_qty - alreadyInCart;

    // 🚫 already fully consumed
    if (remainingStock <= 0) {
      showToast(
        "This product is already fully added to your quote",
        "warning"
      );
      return;
    }

    // 🚫 user asking more than remaining
    if (qty > remainingStock) {
      showToast(
        `Only ${remainingStock} item(s) available (already in quote)`,
        "warning"
      );
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

      // ✅ immediately reflect in UI cart state
      setCartQtyMap(prev => ({
        ...prev,
        [id]: alreadyInCart + qty,
      }));

      showToast("Added to Quote successfully", "success");
    } finally {
      setAdding(false);
    }
  };



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
                <span className={styles.activeCrumb}>
    {product.breadcrumb.productName}
  </span>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="row mt-0 g-4">

            {/* IMAGES – MIXED HEIGHT MASONRY */}
            <div className="col-lg-6 mt-2 ">
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
            <div className="col-lg-6 mt-1 ">
              <div className={styles.rightBox}>

                <div className={styles.section}>
                  <h6 className={styles.sectionTitle}><b>Description</b></h6>
                  <p className={styles.descText}>This premium handmade paper diary honours the timeless grandeur of 
Shaniwar Wada, built in 1732 as the seat of the Peshwas. Once a centre of authority, 
artistry, and ceremony, its mighty gates and intricate carvings still speak of Maratha 
power and resilience despite the fire of 1828. Crafted with artisanal care, the diary’s 
handmade texture reflects the fort’s enduring strength, making it a treasured canvas 
for your own ideas. Each page turns like a chapter of history, blending heritage with 
creativity. Let this diary inspire you to record thoughts with the same permanence as 
Pune’s regal legacy.</p>
                </div>

                <div className={styles.section}>
                  <h6 className={styles.sectionTitle}><b>Product Details</b></h6>

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
                      inputMode="numeric"
                      min="1"
                      max={product.stock_qty}
                      step="1"
                      value={qty ?? ""}

                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}

                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                          setQty("");
                          return;
                        }

                        const num = Number(value);

                        if (num < 1) return;

                        if (num > product.stock_qty) {
                          showToast(
                            "Requested quantity exceeds available stock",
                            "warning"
                          );
                          return;
                        }

                        setQty(num);
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
       
         <footer className={`${css.productDetails_Footer} `}>
      
      <div className={css.designLayer}></div>

      <img
        src="/images/trilogo.png"
        alt="IndiHands"
        className={css.logo}
      />

      <div className={css.text}>
        ©2026 | indiHands | www.indihands.com
      </div>

    </footer>
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
