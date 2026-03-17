"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./rfqDetails.module.css";
import PageWrapper from "../../../../components/common/wrapper";
import useAuthGuard from "../../hooks/useAuthGuard";
import css from "../../Footer/Footer.module.css";
export default function RFQDetailsPage() {
   useAuthGuard();
  const params = useParams();
  const rfqId = Array.isArray(params.rfqId)
    ? params.rfqId[0]
    : params.rfqId;

  const router = useRouter();

  const [rfq, setRfq] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("client_token");
    if (!token || !rfqId) {
      setLoading(false);
      return;
    }

    fetch(`/api/client/rfq-details/${rfqId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setRfq(data.rfq || null);
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch((err) => {
        console.error("RFQ details fetch error:", err);
        setRfq(null);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [rfqId]);


  const handleLogout = async () => {
    try {
      await fetch("/api/client/auth/logout", { method: "POST" });
    } catch {}

    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    router.push("/login");
  };

  if (loading) return <PageWrapper loading />;

  if (!rfq) {
    return (
      <PageWrapper>
        <div className={styles.emptyState}>
          <h5>RFQ not found</h5>
          <button
            className={styles.secondaryBtn}
            onClick={() => router.push("/client/rfq-history")}
          >
            Back to RFQ History
          </button>
        </div>
      </PageWrapper>
    );
  }

  const statusKey = rfq.status
    ? rfq.status.toLowerCase().replace(/\s+/g, "")
    : "submitted";

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + Number(i.total), 0);

  return (
    <PageWrapper>
      <div className={`${styles.dashboardWrapper} container-fluid`}>
        <div className={styles.dashboardCanvas} />
  <div className="d-flex justify-content-end">
         <div>
            <button className='logoutBtn me-5 ' onClick={handleLogout}>
          Logout
        </button>

         </div>

      </div>
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h4 className="pageTitle">
              {rfq.rfq_number || `RFQ-${rfq.id}`}
            </h4>

            <p className={styles.subText}>
              Submitted on{" "}
              {new Date(rfq.submitted_at).toLocaleDateString("en-IN")}
            </p>

            {/* CLIENT INFO */}
            <dl className={styles.clientInfo}>
              <dt>Client :</dt>
              <dd>{rfq.client_name}</dd>
              <dt>Phone :</dt>
              <dd>{rfq.client_phone}</dd>
              <dt>Email :</dt>
              <dd>{rfq.client_email}</dd>
            </dl>
          </div>

          <span className={`${styles.status} ${styles[statusKey]}`}>
            <span className={styles.statusDot} />
            {rfq.status}
          </span>
        </div>

        {/* PRODUCTS */}
        <div className={styles.card}>
          <h6 className={styles.sectionTitle}>Requested Products</h6>

          <div className={styles.tableResponsive}>
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="text-end">Rate</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.product_name}</td>
                    <td className="text-end">
                      ₹ {Number(item.quoted_price).toLocaleString()}
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end fw-semibold">
                      ₹ {Number(item.total).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Items Cards */}
          <div className={styles.mobileItems}>
            {items.map((item, idx) => (
              <div key={idx} className={styles.itemCard}>
                <div className={styles.itemName}>{item.product_name}</div>
                <div className={styles.itemDetails}>
                  <div>Rate: ₹{Number(item.quoted_price).toLocaleString()}</div>
                  <div>Qty: {item.quantity}</div>
                  <div className={styles.itemTotal}>Total: ₹{Number(item.total).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUMMARY */}
        <div className={styles.summaryCard}>
          <div>
            <span>Total Items - </span>
            <strong>{totalItems}</strong>
          </div>

          <div>
            <span>Grand Total - </span>
            <strong>₹ {totalAmount.toLocaleString()}</strong>
          </div>
        </div>

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button
            className={styles.secondaryBtn}
            onClick={() => router.push("/client/rfq-history")}
          >
            Back
          </button>

          <button
            className={styles.primaryBtn}
            onClick={() =>
              window.open(`/api/client/rfq-download/${rfq.id}`)
            }
          >
            Download PDF
          </button>
        </div>

          <footer className={`${css.rfqDetails_Footer} ${styles.rfqFooter}`}>
      
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
