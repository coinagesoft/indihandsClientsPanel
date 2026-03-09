"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./rfqHistory.module.css";
import React from "react";
import PageWrapper from "../../../components/common/wrapper";
import useAuthGuard from "../hooks/useAuthGuard";
import css from "../Footer/Footer.module.css";
import Footer from "../Footer/page";
export default function RFQHistoryPage() {
    useAuthGuard();
  const router = useRouter();

  const [rfqs, setRfqs] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true); 

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

  return (
    <PageWrapper loading={loading}>
      <div className={`${styles.dashboardWrapper} container-fluid`}>
        <div className={styles.dashboardCanvas} />

        <h4 className="pageTitle">RFQ History</h4>

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
                          onClick={() =>
                            setExpanded(isOpen ? null : rfq.rfq_id)
                          }
                        >
                          <td>
                            <span className={styles.rfqBadge}>
                              {rfq.rfq_number || `RFQ-${rfq.rfq_id}`}
                            </span>
                          </td>
                          <td>
                            {new Date(
                              rfq.created_date
                            ).toLocaleDateString("en-IN")}
                          </td>
                          <td>{rfq.total_items}</td>
                          <td>
                            ₹ {Number(rfq.total_amount).toLocaleString()}
                          </td>
                          <td>
                            <span
                              className={`${styles.status} ${styles[statusKey]}`}
                            >
                              <span className={styles.statusDot} />
                              {rfq.status}
                            </span>
                          </td>
                          <td className={styles.expandIcon}>
                            <span
                              className={`${styles.chevron} ${
                                isOpen ? styles.open : ""
                              }`}
                            >
                              ❯
                            </span>
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
                                  {rfq.total_items} products requested with a
                                  total quoted value of ₹{" "}
                                  {Number(
                                    rfq.total_amount
                                  ).toLocaleString()}
                                  .
                                </p>
                              </div>

                              <div className={styles.expandActions}>
                                <button
                                  className={`${styles.actionBtn} ${styles.secondaryBtn}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/client/rfq-details/${rfq.rfq_id}`
                                    );
                                  }}
                                >
                                  View Details
                                </button>

                                <a
                                  href={`/api/client/rfq-download/${rfq.rfq_id}`}
                                  className={`${styles.actionBtn} ${styles.primaryBtn}`}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Download PDF
                                </a>
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
