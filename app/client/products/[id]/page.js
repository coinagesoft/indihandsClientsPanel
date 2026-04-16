"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./productDetails.module.css";
import PageWrapper from "../../../../components/common/wrapper";
import Toast from "../../../../components/common/Toast";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import useAuthGuard from "../../hooks/useAuthGuard";
import css from "../../Footer/Footer.module.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useCart } from "../../../context/CartContext";
import Image from "next/image";


export default function ProductDetailsPage() {

  const { id } = useParams();
  useAuthGuard();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [cartQtyMap, setCartQtyMap] = useState({});
  const { cartCount, fetchCartCount } = useCart();
  const toastTimer = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgLoading, setImgLoading] = useState(true);

  const showToast = (message, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);

    setToast({ message, type });

    toastTimer.current = setTimeout(() => {
      setToast({ message: "", type: "" });
    }, 3000);
  };


  const formatDescription = (text) => {
    if (!text) return text;

    const lines = text.split("\n");

    return lines.map((line, index) => {
      const match = line.match(/^(.+?:)\s*(.*)$/);

      if (match) {
        return (
          <div key={index} style={{ marginTop: "12px" }}>
            <b>{match[1]}</b>
            <div style={{ whiteSpace: "pre-line" }}>{match[2]}</div>
          </div>
        );
      }

      return (
        <div key={index} style={{ marginTop: "10px", whiteSpace: "pre-line" }}>
          {line}
        </div>
      );
    });
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  /* ================= MASONRY DUMMY IMAGES ================= */
  const images = [
    "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=900&q=80", // landscape
    "https://images.unsplash.com/photo-1519664824562-b4bc73f9795a?q=80&w=327&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // portrait
    "https://images.unsplash.com/photo-1712232971357-fd8f4b5e313c?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // medium
    "https://images.unsplash.com/photo-1647437992378-f47b93029d15?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1711871124431-836d92aed0d9?q=80&w=478&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // tall
    "https://images.unsplash.com/photo-1647107349002-85e66a39abd3?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/client/auth/logout", { method: "POST" });
    } catch { }

    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    router.push("/login");
  };

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

      fetchCartCount();
      showToast("Added to Quote successfully", "success");
    } finally {
      setAdding(false);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % product.images.length;
    setCurrentIndex(nextIndex);
    setPreviewImg(product.images[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex =
      (currentIndex - 1 + product.images.length) % product.images.length;
    setCurrentIndex(prevIndex);
    setPreviewImg(product.images[prevIndex]);
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
          <div className={styles.headerBox}>

            {/* Breadcrumb Row */}
            <div className="row">
              <div className='breadcrumbBox col-8'>

                <Link href="/client/dashboard" className="crumbLink">
                  {product.breadcrumb.dashboard}
                </Link>

                {" > "}

                <Link href="/client/product-catalog" className="crumbLink">
                  {product.breadcrumb.catalogName}
                </Link>

                {" > "}

                <Link
                  href={`/client/products?catalogId=${product.catalogId}`}
                  className="crumbLink"
                >
                  {product.breadcrumb.products}
                </Link>

                {" > "}

                <span className='activeCrumb'>
                  {product.breadcrumb.productName
                    ?.toLowerCase()
                    .replace(/\b\w/g, char => char.toUpperCase())}
                </span>

              </div>
              <div className="col-4 ">
                <div className="d-flex align-items-center justify-content-end gap-1">
<button
  className='guideBtn'
  onClick={() => window.open("/indiHands_Client_Portal – User_Guide.pdf", "_blank")}
>
  User Guide
</button>
                  {/* LOGOUT */}
                  <button className="logoutBtn" onClick={handleLogout}>
                    Logout
                  </button>

                  <div
                    className="cartIconBox"
                    onClick={() => router.push("/client/quote-cart")}
                  >
                    <HiOutlineShoppingBag size={18} className="cartIcon" />

                    {cartCount > 0 && (
                      <span className="cartBadge">{cartCount}</span>
                    )}
                  </div>

                </div>
              </div>

            </div>

          </div>


          <div className="row mt-1">
            <div className="col-6">
              <h4 className="productTitle ">
                {product.title
                  ?.toLowerCase()
                  .replace(/\b\w/g, char => char.toUpperCase())}
              </h4>
            </div>

          </div>
          {/* CONTENT */}
          <div className="row mt-0 g-4 mb-5">

            {/* IMAGES – MIXED HEIGHT MASONRY */}
            <div className="col-lg-6 mt-2 ">


              <div className={styles.masonry}>
                {product.images.map((img, index) => (
                  <div key={index} className={styles.masonryItem}>
                    <Image
                      src={img || "/images/default-product-image.jpg"}
                      alt={product.title}
                      width={500}
                      height={170}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{
                        width: "100%",
                      }}
                      onClick={() => {
                        setPreviewImg(img);
                        setCurrentIndex(index);
                        setImgLoading(true);
                      }}
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
                  <div className={styles.descText}>
                    {formatDescription(product.description)}
                  </div>
                </div>

                <div className={styles.section}>
                  <h6 className={styles.sectionTitle}><b>Product Details</b></h6>

                  <div className="row">
                    <div className="col-6">
                      <p className="mt-0 mb-0"><b>Code:</b> {product.details.code}</p>
                      <p className="mt-0 mb-0"><b>Size:</b> {product.details.size}</p>
                      <p className="mt-0 mb-0">
                        <b>Weight:</b>{" "}
                        {product.details.weight?.replace(/GM/g, "gm")}
                      </p>                    </div>
                    <div className="col-6 ">
                      <p className="mt-0 mb-0">
                        <b>Price:</b>{" "}
                        {(() => {
                          const price = product.price;

                          if (!price) return "₹0";

                          // range case
                          if (typeof price === "string" && price.includes("-")) {
                            const [min, max] = price.split("-");

                            return `₹${Number(min).toLocaleString("en-IN")} - ₹${Number(max).toLocaleString("en-IN")}`;
                          }

                          // normal number
                          return new Intl.NumberFormat("en-IN", {
                            style: "currency",
                            currency: "INR",
                          }).format(Number(price));
                        })()}
                      </p>
                      <p className="mt-0 mb-0"><b>HSN:</b> {product.hsn || "-"}</p>
                      {/* ✅ STOCK */}
                      <p>
                        <b className="mt-0 mb-0">Stock:</b>{" "}
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
                    className={`${styles.addBtn} ${product.stock_qty === 0 ? styles.disabledBtn : ""
                      }`}
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

              {/* ✅ LOADER */}
              {imgLoading && <div className={styles.loader}></div>}

              {/* ✅ IMAGE (ALWAYS RENDER) */}
              <Image
                src={previewImg}
                alt="Preview"
                width={800}
                height={800}
                priority
                onLoadingComplete={() => setImgLoading(false)}
                style={{
                  width: "auto",
                  height: "100%",
                  opacity: imgLoading ? 0 : 1,
                  transition: "opacity 0.3s ease",
                }}
              />

              {/* ✅ CONTROLS ONLY AFTER LOAD */}
              {!imgLoading && (
                <>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setPreviewImg(null)}
                  >
                    <svg viewBox="0 0 100 100" className={styles.closeIcon}>
                      <defs>
                        <mask id="cutX">
                          <rect width="100" height="100" fill="white" />
                          {/* ❌ cut X shape */}
                          <line x1="25" y1="25" x2="75" y2="75" stroke="black" strokeWidth="6" />
                          <line x1="75" y1="25" x2="25" y2="75" stroke="black" strokeWidth="6" />
                        </mask>
                      </defs>

                      {/* white circle with X cut out */}
                      <circle cx="50" cy="50" r="50" fill="white" mask="url(#cutX)" />
                    </svg>
                  </button>

                  <button
                    className={styles.arrowLeft}
                    onClick={handlePrev}
                  >
                    <IoChevronBack size={26} />
                  </button>

                  <button
                    className={styles.arrowRight}
                    onClick={handleNext}
                  >
                    <IoChevronForward size={26} />
                  </button>
                </>
              )}

            </div>
          </div>
        )}


      </PageWrapper>
    </>
  );
}
