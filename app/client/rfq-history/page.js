"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./rfqHistory.module.css";
import React from "react";
export default function RFQHistoryPage() {
  const router = useRouter();

  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch("/api/client/rfq-history")
      .then(res => res.json())
      .then(data => {
        setRfqs(Array.isArray(data.rfqs) ? data.rfqs : []);
      })
      .finally(() => setLoading(false));
  }, []);

 

  if (rfqs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h5>No RFQs found</h5>
        <p>Your submitted RFQs will appear here.</p>
      </div>
    );
  }

  return (
   <div className={`${styles.dashboardWrapper} container-fluid py-5`}>
      <div className={styles.dashboardCanvas} ></div>

      <div className="row mt-3">
        <div className="col">
          <h4 className={styles.pageTitle}>RFQ History</h4>
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
                {rfqs.map(rfq => {
                  const isOpen = expanded === rfq.rfq_id;
                  const statusKey =
                    rfq.status?.toLowerCase().replace(/\s+/g, "");

                  return (
                    <React.Fragment key={rfq.rfq_id}>
                      <tr
                        key={rfq.rfq_id}
                        className={styles.rowClickable}
                        onClick={() =>
                          setExpanded(isOpen ? null : rfq.rfq_id)
                        }
                      >
                        <td>
                          <span className={styles.rfqBadge}>
                            RFQ-{rfq.rfq_id}
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
                            className={`${styles.status} ${
                              styles[statusKey]
                            }`}
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

                      {isOpen && (
                        <tr className={styles.expandRow}>
                          <td colSpan="6" className={styles.expandCell}>
                            <div className={styles.expandBox}>
                              <div>
                                <strong>RFQ Summary</strong>
                                <p className="mb-0">
                                  {rfq.total_items} products requested with a
                                  total quoted value of ₹{" "}
                                  {Number(
                                    rfq.total_amount
                                  ).toLocaleString()}.
                                </p>
                              </div>

                              <div className={styles.expandActions}>
                                <button
                                  className={styles.secondaryBtn}
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
                                  className={styles.primaryBtn}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Download PDF
                                </a>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
