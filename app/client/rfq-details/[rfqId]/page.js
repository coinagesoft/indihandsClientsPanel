"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./rfqDetails.module.css";

export default function RFQDetailsPage() {
  const { rfqId } = useParams();
  const router = useRouter();

  const [rfq, setRfq] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/client/rfq-details/${rfqId}`)
      .then(res => res.json())
      .then(data => {
        setRfq(data.rfq || null);
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .finally(() => setLoading(false));
  }, [rfqId]);

  if (loading) {
    return <div className={styles.loading}>Loading RFQ details…</div>;
  }

  if (!rfq) {
    return (
      <div className={styles.emptyState}>
        <h5>RFQ not found</h5>
        <button
          className={styles.secondaryBtn}
          onClick={() => router.push("/client/rfq-history")}
        >
          Back to RFQ History
        </button>
      </div>
    );
  }

  const statusKey = rfq.status
    ? rfq.status.toLowerCase().replace(/\s+/g, "")
    : "submitted";

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + Number(i.total), 0);

  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h4 className={styles.pageTitle}>RFQ-{rfq.id}</h4>
          <p className={styles.subText}>
            Submitted on{" "}
            {new Date(rfq.submitted_at).toLocaleDateString("en-IN")}
          </p>
        </div>

        <span className={`${styles.status} ${styles[statusKey]}`}>
          <span className={styles.statusDot} />
          {rfq.status}
        </span>
      </div>

      {/* PRODUCTS */}
      <div className={styles.card}>
        <h6 className={styles.sectionTitle}>Requested Products</h6>

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

      {/* SUMMARY */}
      <div className={styles.summaryCard}>
        <div>
          <span>Total Items - </span>
          <strong> {totalItems}</strong>
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
    </div>
  );
}
