"use client";

import styles from "./proposalDetails.module.css";

export default function ProposalDetailsPage() {
  // Dummy data (API later)
  const proposal = {
    rfqId: "RFQ-003",
    proposalId: "PROP-1203",
    date: "28-01-2026",
    status: "Approved",
    items: [
      {
        name: "Shaniwar Wada, Pune: Handmade Paper Journal",
        qty: 3,
        price: 849,
        total: 2547,
      },
      {
        name: "Kalpavruksha: Handmade A5 Size Jute Diary",
        qty: 2,
        price: 1343,
        total: 2686,
      },
    ],
  };

  const grandTotal = proposal.items.reduce(
    (sum, i) => sum + i.total,
    0
  );

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mt-3">
        <div className="col">
          <h4 className={styles.pageTitle}>Proposal Details</h4>
          <p className={styles.subTitle}>
            RFQ ID: <b>{proposal.rfqId}</b> | Proposal ID:{" "}
            <b>{proposal.proposalId}</b>
          </p>
        </div>
      </div>

      {/* Status Box */}
      <div className="row mt-2">
        <div className="col-md-4">
          <div className={styles.statusBox}>
            Status:{" "}
            <span
              className={`${styles.status} ${
                styles[proposal.status.toLowerCase()]
              }`}
            >
              {proposal.status}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="row mt-3">
        <div className="col-12">
          <div className={styles.tableBox}>
            <table className={`table mb-0 ${styles.customTable}`}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {proposal.items.map((item, index) => (
                  <tr key={index}>
                    <td className={styles.productName}>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>₹ {item.price}</td>
                    <td>₹ {item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="row mt-3">
        <div className="col-lg-4 col-md-6">
          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
              <span>Grand Total</span>
              <span>₹ {grandTotal}</span>
            </div>

            <button className={styles.actionBtn}>
              Download Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
