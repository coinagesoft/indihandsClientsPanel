"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useCart } from "../../context/CartContext";
import useAuthGuard from "../hooks/useAuthGuard";
import PageWrapper from "../../../components/common/wrapper";
import css from "../Footer/Footer.module.css";

export default function DashboardPage() {
  useAuthGuard();
  const router = useRouter();
  const [search, setSearch] = useState("");
const [results, setResults] = useState([]);
  const { cartCount, fetchCartCount } = useCart();
  const [stats, setStats] = useState([]);
  const [recentRFQs, setRecentRFQs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("client_token");

      if (!token) {
        console.error("Token missing");
        setLoading(false);
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [statsRes, rfqsRes] = await Promise.all([
          fetch("/api/client/dashboard/stats", { headers }),
          fetch("/api/client/dashboard/recent-rfqs", { headers }),
        ]);

        if (!statsRes.ok || !rfqsRes.ok) {
          throw new Error("Unauthorized");
        }

        const statsData = await statsRes.json();
        const rfqsData = await rfqsRes.json();
        console.log("rfqs", rfqsData)

        setStats([
          { label: "OPEN RFQs", value: statsData.openRFQs ?? 0 },
          { label: "ACCEPTED RFQs", value: statsData.acceptedRFQs ?? 0 },
          { label: "PENDING PROPOSALS", value: statsData.pendingProposals ?? 0 },
          { label: "REJECTED RFQs", value: statsData.rejectedRFQs ?? 0 },
        ]);

        setRecentRFQs(Array.isArray(rfqsData) ? rfqsData : []);
      } catch (error) {
        console.error("Dashboard load error:", error);
        setStats([]);
        setRecentRFQs([]);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/client/auth/logout", { method: "POST" });
    } catch { }

    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    router.push("/login");
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  const statusClassMap = {
    Submitted: "submitted",
    "Under Review": "underreview",
    Accepted: "accepted",
    Rejected: "rejected",
    Draft: "draft",
  };



  return (
    <PageWrapper loading={loading}>
      <div className={`${styles.dashboardWrapper} container-fluid `}>
        <div className={styles.dashboardCanvas} />

        {/* ================= STATS ================= */}
        <div className="d-flex align-items-center mt-0">
  
  {/* LEFT */}
  <div style={{ minWidth: "200px" }}>
    <h4 className='pageTitle'>Dashboard</h4>
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
  <div className="d-flex align-items-center gap-2" style={{ minWidth: "250px", justifyContent: "flex-end" }}>
    <button
      className='guideBtn'
      onClick={() => window.open("/indiHands_Client_Portal – User_Guide.pdf", "_blank")}
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
        <div className="row g-4 mt-2">
          {stats.map((item, index) => (
            <div key={index} className="col-xl-3 col-lg-3 col-md-6 col-sm-12 col-12">

              <div className={styles.statWidget}>
                <span className={`${styles.statLabel} text-center`}>{item.label}</span>
                <div className={`${styles.statValue} text-center`}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= RECENT RFQs ================= */}
        <div className={styles.recentBox}>
          <h4 className={styles.recentTitle}>Recent RFQs</h4>

          <div className="table-responsive mt-3">
            <table className={`table-custom ${styles.tableCustom}`}>
              <thead>
                <tr>
                  <th>RFQ ID</th>
                  <th>Branch</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th className="pstatus">Status</th>
                  {/* <th>Notes</th> */}
                </tr>
              </thead>
              <tbody>
                {recentRFQs.map((rfq) => (
                  <tr key={rfq.id}>
                    <td className={styles.rfqId}>{rfq.rfq_number}</td>
                    <td>{rfq.branch}</td>
                    <td>{rfq.submittedAt}</td>
                    <td>{rfq.items}</td>
                    <td>
                      <span
                        className={`${styles.status} ${styles[statusClassMap[rfq.status]]
                          }`}
                      >
                        {rfq.status}
                      </span>
                    </td>
                    {/* <td className={styles.notes}>{rfq.notes}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <footer className={`${css.dashboard_Footer} `}>

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
