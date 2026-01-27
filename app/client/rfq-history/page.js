"use client";

import styles from "./rfqHistory.module.css";

export default function RFQHistoryPage() {
  // Dummy RFQ data (API later)
  const rfqs = [
    {
      id: "RFQ-001",
      date: "25-01-2026",
      items: 5,
      total: "₹ 1,25,000",
      status: "Open",
    },
    {
      id: "RFQ-002",
      date: "26-01-2026",
      items: 3,
      total: "₹ 89,500",
      status: "Pending",
    },
    {
      id: "RFQ-003",
      date: "28-01-2026",
      items: 8,
      total: "₹ 2,10,000",
      status: "Approved",
    },
  ];

  return (
    <div className="container-fluid">
      {/* Page Title */}
      <div className="row mt-3">
        <div className="col">
          <h4 className={styles.pageTitle}>RFQ History</h4>
        </div>
      </div>

      {/* RFQ Table */}
      <div className="row mt-3">
        <div className="col-12">
          <div className={styles.tableBox}>
            <table className={`table mb-0 ${styles.customTable}`}>
              <thead>
                <tr>
                  <th>RFQ ID</th>
                  <th>Date</th>
                  <th>No. of Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {rfqs.map((rfq) => (
                  <tr key={rfq.id}>
                    <td className={styles.rfqId}>{rfq.id}</td>
                    <td>{rfq.date}</td>
                    <td>{rfq.items}</td>
                    <td>{rfq.total}</td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          styles[rfq.status.toLowerCase()]
                        }`}
                      >
                        {rfq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
