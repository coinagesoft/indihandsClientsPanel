"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import useAuthGuard from "../hooks/useAuthGuard";
import PageWrapper from "../../../components/common/wrapper";

export default function DashboardPage() {
  useAuthGuard();

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
      console.log("rfqs",rfqsData)

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

 

  return (
    <PageWrapper loading={loading}>
    <div className={`${styles.dashboardWrapper} container-fluid `}>
      <div className={styles.dashboardCanvas} />

      {/* ================= STATS ================= */}
         <h4 className='pageTitle'>Dashboard</h4>
      <div className="row g-4 mt-2">
        {stats.map((item, index) => (
          <div key={index} className="col-xl-3 col-lg-4 col-md-6">
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
                <th>Status</th>
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
                      className={`${styles.status} ${
                        styles[statusClassMap[rfq.status]]
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
    </div>
    </PageWrapper>
  );
}
