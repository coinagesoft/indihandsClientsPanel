"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import useAuthGuard from "../hooks/useAuthGuard";
export default function DashboardPage() {
useAuthGuard();

  const [stats, setStats] = useState([]);
  const [recentRFQs, setRecentRFQs] = useState([]);

  useEffect(() => {
    fetch("/api/client/dashboard/stats")
      .then(res => res.json())
      .then(data => {
        setStats([
          { label: "OPEN RFQs", value: data.openRFQs ?? 0 },
          { label: "ACCEPTED RFQs", value: data.acceptedRFQs ?? 0 },
          { label: "PENDING PROPOSALS", value: data.pendingProposals ?? 0 },
          { label: "ACTIVE QUOTE ITEMS", value: data.activeQuoteItems ?? 0 },
        ]);
      });
  }, []);

  useEffect(() => {
    fetch("/api/client/dashboard/recent-rfqs")
      .then(res => res.json())
      .then(data => setRecentRFQs(Array.isArray(data) ? data : []));
  }, []);

  const statusClassMap = {
    Submitted: "submitted",
    "Under Review": "underreview",
    Accepted: "accepted",
    Rejected: "rejected",
  };

  return (
    <>
      {/* ✅ BACKGROUND CANVAS (NO CHILDREN) */}
      <div className="dashboard-canvas" />

      {/* ✅ CONTENT LAYER */}
      <div className={`${styles.dashboardWrapper} container-fluid`}>
        {/* STATS */}
        <div className="row g-4 mt-2">
          {stats.map((item, index) => (
            <div key={index} className="col-xl-3 col-lg-4 col-md-6">
              <div className={styles.statWidget}>
                <span className={styles.statLabel}>{item.label}</span>
                <div className={styles.statValue}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* RECENT RFQs */}
        <div className={`${styles.recentBox} mt-5`}>
          <h4 className={styles.recentTitle}>Recent RFQs</h4>

          <div className="table-responsive mt-3">
            <table className={`table ${styles.tableCustom}`}>
              <thead>
                <tr>
                  <th>RFQ ID</th>
                  <th>Branch</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentRFQs.map(rfq => (
                  <tr key={rfq.id}>
                    <td className={styles.rfqId}>RFQ-{rfq.id}</td>
                    <td>{rfq.branch}</td>
                    <td>{rfq.submittedAt}</td>
                    <td>{rfq.items}</td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          styles[statusClassMap[rfq.status]]
                        }`}
                      >
                        {rfq.status}
                      </span>
                    </td>
                    <td className={styles.notes}>{rfq.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
