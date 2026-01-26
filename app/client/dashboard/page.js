"use client";

import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const recentRFQs = [
    { rfqId: "RFQ001", date: "25-01-2026", status: "Open", total: "₹ 1,25,000" },
    { rfqId: "RFQ002", date: "26-01-2026", status: "Pending", total: "₹ 89,500" },
  ];

  return (
    <div className="container-fluid">
      {/* ✅ TOP CARDS */}
      <div className="row g-4 mt-2">
        <div className="col-md-4">
          <div className={`${styles.statCard} p-4`}>
            <p className={styles.statText}>OPEN RFQs</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className={`${styles.statCard} p-4`}>
            <p className={styles.statText}>PENDING PROPOSALS</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className={`${styles.statCard} p-4`}>
            <p className={styles.statText}>APPROVED REQUESTS</p>
          </div>
        </div>
      </div>

      {/* ✅ RECENT RFQs */}
      <div className={`${styles.recentBox} mt-4 p-4`}>
        <h4 className={styles.recentTitle}>RECENT RFQs</h4>

        <div className={`${styles.tableBox} p-3 mt-3`}>
          <table className={`table ${styles.tableCustom}`}>
            <thead>
              <tr>
                <th>RFQ Id</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {recentRFQs.map((rfq, i) => (
                <tr key={i}>
                  <td>{rfq.rfqId}</td>
                  <td>{rfq.date}</td>
                  <td>{rfq.status}</td>
                  <td>{rfq.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Figma lines (optional) */}
          <div className={styles.lines}>
            <div className={styles.line}></div>
            <div className={styles.line}></div>
            <div className={styles.line}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
