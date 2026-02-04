"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import useAuthGuard from "../hooks/useAuthGuard";
export default function DashboardPage() {
  useAuthGuard();

  const [stats, setStats] = useState([]);
  const [recentRFQs, setRecentRFQs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, rfqsRes] = await Promise.all([
          fetch("/api/client/dashboard/stats"),
          fetch("/api/client/dashboard/recent-rfqs"),
        ]);

        const statsData = await statsRes.json();
        const rfqsData = await rfqsRes.json();

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

  const statusClassMap = {
    Submitted: "submitted",
    "Under Review": "underreview",
    Accepted: "accepted",
    Rejected: "rejected",
  };

   if (loading) {
    return (
      <div
        className="mt-5"
        // style={{ minHeight: "70vh" }}
      >
        <div className="text-muted text-center mt-5">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <div className={`${styles.dashboardWrapper} container-fluid pt-5 pb-4`}>
        <div className={styles.dashboardCanvas}></div>

        {/* STATS CARDS */}
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

        {/* RECENT RFQs TABLE */}
        <div className={styles.recentBox}>
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
                {recentRFQs.map((rfq) => (
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
