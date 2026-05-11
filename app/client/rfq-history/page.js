"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./rfqHistory.module.css";
import React from "react";
import PageWrapper from "../../../components/common/wrapper";
import useAuthGuard from "../hooks/useAuthGuard";
import css from "../Footer/Footer.module.css";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import Footer from "../Footer/page";
import { useCart } from "../../context/CartContext";

export default function RFQHistoryPage() {
    useAuthGuard();
  const router = useRouter();

  const [rfqs, setRfqs] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
   const { cartCount, fetchCartCount } = useCart();

  const handleSearch = async (value) => {
  setSearch(value);

  if (!value) {
    setResults([]);
    return;
  }

  try {
    const token = localStorage.getItem("client_token");

    const res = await fetch(
      `/api/client/globalFilter?search=${value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    setResults(data.products || []);
  } catch (err) {
    console.error("Search error:", err);
  }
};

  useEffect(() => {
    const token = localStorage.getItem("client_token");

    if (!token) {
      console.error("Token missing");
      setLoading(false); // ✅ stop loader
      return;
    }

    fetch("/api/client/rfq-history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setRfqs(Array.isArray(data.rfqs) ? data.rfqs : []);
      })
      .catch((err) => {
        console.error("RFQ history fetch error:", err);
        setRfqs([]);
      })
      .finally(() => {
        setLoading(false); // ✅ ALWAYS stop loader
      });
  }, []);

  /* ✅ EMPTY STATE (after loading only) */
  if (!loading && rfqs.length === 0) {
    return (
      <PageWrapper loading={false}>
        <div className={styles.emptyState}>
          <h5>No RFQs found</h5>
          <p className="mb-0 pb-0">Your submitted RFQs will appear here.</p>
        </div>
        <Footer/>
      </PageWrapper>
    );
  }
  const handleLogout = async () => {
    try {
      await fetch("/api/client/auth/logout", { method: "POST" });
    } catch {}

    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    router.push("/login");
  };
  return (
    <PageWrapper loading={loading}>
      <div className={`${styles.dashboardWrapper} container-fluid`}>
        <div className={styles.dashboardCanvas} />

<div className="d-flex align-items-center">

  {/* LEFT */}
  <div style={{ minWidth: "220px" }}>
    <h4 className="pageTitle">RFQ History</h4>
  </div>

  {/* CENTER (SEARCH) */}
  <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
    <div className="global-search">
      <input
        type="text"
        placeholder="Search products (name / code)..."
        className="global-search-input"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {search && (
        <span
          className="global-search-clear"
          onClick={() => {
            setSearch("");
            setResults([]);
          }}
        >
          ×
        </span>
      )}

      {results.length > 0 && (
        <div className="global-search-dropdown">
          {results.map((item) => (
            <div
              key={item.id}
              className="global-search-item"
              onClick={() => {
                setResults([]);
                setSearch("");
                router.push(`/client/products/${item.id}`);
              }}
            >
              <div className="global-search-name">
                {item.product_name}
              </div>
              <div className="global-search-code">
                Code: {item.barcode || "-"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>

  {/* RIGHT */}
  <div
    className="d-flex align-items-center gap-2"
    style={{ minWidth: "250px", justifyContent: "flex-end" }}
  >
    <button
      className="guideBtn"
      onClick={() =>
        window.open("/indiHands_Client_Portal – User_Guide.pdf", "_blank")
      }
    >
      User Guide
    </button>

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
        <div className="row ">
          <div className="col">
            <p className={styles.subtitle}>
              Track your submitted requests and their progress
            </p>
          </div>
        </div>

        <div className="row mt-3 mb-5">
          <div className="col-12">
            <div className={styles.tableBox}>
              <table className={`table mb-0 ${styles.customTable}`}>
                <thead>
                  <tr>
                    <th>RFQ</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {rfqs.map((rfq) => {
                    const isOpen = expanded === rfq.rfq_id;
                    const statusKey =
                      rfq.status?.toLowerCase().replace(/\s+/g, "");

                    return (
                      <React.Fragment key={ rfq.rfq_id}>
                        {/* MAIN ROW */}
                     <tr
  className={styles.rowClickable}
  onClick={() => {
    if (rfq.rfq_type === "B2B") return; // ← add this
    setExpanded(isOpen ? null : rfq.rfq_id);
  }}
>
<td data-label="RFQ">
                            <span className={styles.rfqBadge}>
                              {rfq.rfq_number || `RFQ-${rfq.rfq_id}`}
                            </span>
                          </td>
<td data-label="Date">
                            {new Date(
                              rfq.created_date
                            ).toLocaleDateString("en-IN")}
                          </td>
<td data-label="Items">
  {rfq.rfq_type === "B2B" ? "—" : rfq.total_items}
</td>
<td data-label="Amount">
  {rfq.rfq_type === "B2B" 
    ? "—" 
    : `₹ ${Number(rfq.total_amount).toLocaleString()}`
  }
</td>
<td data-label="Status">
                            <span
                              className={`${styles.status} ${styles[statusKey]}`}
                            >
                              <span className={styles.statusDot} />
                              {rfq.status}
                            </span>
                          </td>
                       <td className={styles.expandIcon}>
  {rfq.rfq_type !== "B2B" && (
    <span className={`${styles.chevron} ${isOpen ? styles.open : ""}`}>
      ❯
    </span>
  )}
</td>
                        </tr>

                        {/* EXPAND ROW */}
                        <tr
                          className={`${styles.expandRow} ${
                            isOpen ? styles.open : ""
                          }`}
                        >
                          <td colSpan="6" className={styles.expandCell}>
                            <div className={styles.expandBox}>
                             <div>
  <strong>RFQ Summary</strong>
  <p className="mb-0">
    {rfq.rfq_type === "B2B"
      ? "Your request has been submitted."
      : `${rfq.total_items} products requested with a total quoted value of ₹ ${Number(rfq.total_amount).toLocaleString()}.`
    }
  </p>
</div>

                            <div className={styles.expandActions}>

  <button
    className={`${styles.actionBtn} ${styles.secondaryBtn}`}
    onClick={(e) => {
      e.stopPropagation();
      router.push(`/client/rfq-details/${rfq.rfq_id}`);
    }}
  >
    View Details
  </button>

  {rfq.rfq_type === "B2B" ? (
    rfq.download_count > 0 ? (
      <button
        className={`${styles.actionBtn} ${styles.primaryBtn}`}
        disabled
        style={{ opacity: 0.4, cursor: "not-allowed" }}
        onClick={(e) => e.stopPropagation()}
      >
        Already Downloaded
      </button>
    ) : (
      <a
        href={`/api/client/rfq-download/${rfq.rfq_id}`}
        className={`${styles.actionBtn} ${styles.primaryBtn}`}
        onClick={(e) => {
          e.stopPropagation();
          setRfqs(prev =>
            prev.map(r =>
              r.rfq_id === rfq.rfq_id
                ? { ...r, download_count: 1 }
                : r
            )
          );
        }}
      >
        Download PDF
      </a>
    )
  ) : (
    <a
      href={`/api/client/rfq-download/${rfq.rfq_id}`}
      className={`${styles.actionBtn} ${styles.primaryBtn}`}
      onClick={(e) => e.stopPropagation()}
    >
      Download PDF
    </a>
  )}

</div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

               <footer className={`${css.rfqhistory_Footer} `}>
      
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
    </PageWrapper>
  );
}
