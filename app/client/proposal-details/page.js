"use client";

import { useEffect, useState } from "react";
import styles from "./proposalDetails.module.css";

export default function ProposalDetailsPage() {
  const [rfqs, setRfqs] = useState([]);
  const [selectedRfq, setSelectedRfq] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  /* ================= RFQs ================= */
  useEffect(() => {
    fetch("/api/client/rfqs-with-proposals")
      .then(res => res.json())
      .then(setRfqs)
      .catch(() => setRfqs([]));
  }, []);

  /* ================= PROPOSAL BY RFQ ================= */
  useEffect(() => {
    if (!selectedRfq) {
      setData(null);
      return;
    }

    setLoading(true);
    fetch(`/api/client/proposal-by-rfq/${selectedRfq}`)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [selectedRfq]);

  const proposal = data?.proposal;

  const statusKey =
    proposal?.status?.toLowerCase()?.replace(/\s+/g, "") || "";

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* ================= APPROVE / REJECT ================= */
  const updateStatus = async (status) => {
    if (!proposal?.id) return;

    const confirmMsg =
      status === "Approved"
        ? "Are you sure you want to APPROVE this proposal?"
        : "Are you sure you want to REJECT this proposal?";

    if (!confirm(confirmMsg)) return;

    try {
      setActionLoading(true);

      const res = await fetch("/api/client/proposal-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          status,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Action failed");
        return;
      }

      alert(`Proposal ${status} successfully`);

      // 🔄 Reload proposal
      fetch(`/api/client/proposal-by-rfq/${selectedRfq}`)
        .then(res => res.json())
        .then(setData);

    } finally {
      setActionLoading(false);
    }
  };
  useEffect(() => {
    if (data?.totals) {
      console.log("UI Totals", {
        subtotal: data.totals.subtotal,
        totalTax: data.totals.totalTax,
        grandTotal: data.totals.subtotal + data.totals.totalTax,
      });
    }
  }, [data]);

  return (
 <div className={`${styles.dashboardWrapper} container-fluid py-5`}>
  <div className={styles.dashboardCanvas}></div>

  {/* PAGE HEADER */}
  <div className="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 className={styles.pageTitle}>Proposal Details</h4>
      <p className={styles.pageSubtitle}>
        View proposal status, items, and pricing for selected RFQ
      </p>
    </div>
  </div>

  {/* RFQ SELECTION CARD */}
  <div className={styles.sectionCard}>
    <div className="row align-items-end">
      <div className="col-md-4">
        <label className="form-label fw-semibold">Select RFQ</label>
        <select
          className="form-select"
          value={selectedRfq}
          onChange={(e) => setSelectedRfq(e.target.value)}
        >
          <option value="">-- Choose RFQ --</option>
          {rfqs.map((r) => (
            <option key={r.rfq_id} value={r.rfq_id}>
              RFQ-{r.rfq_id}
              {r.proposal_id ? " • Proposal Sent" : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>

  {/* LOADING STATE */}
  {loading && (
    <div className={styles.centerState}>
      <div className={styles.loader}></div>
      <p className="mt-2">Loading proposal details…</p>
    </div>
  )}

  {/* EMPTY STATE */}
  {selectedRfq && !loading && !proposal && (
    <div className={styles.emptyState}>
      <h6>No Proposal Yet</h6>
      <p>The proposal has not been sent for this RFQ.</p>
    </div>
  )}

  {/* ================= PROPOSAL CONTENT ================= */}
  {proposal && (
    <>
      {/* PROPOSAL HEADER */}
      <div className={styles.headerCard}>
        <div>
          <h5 className={styles.proposalNo}>
            Proposal #{proposal.proposal_number}
          </h5>
          <div className={styles.metaLine}>
            RFQ-{proposal.rfq_id} • {formatDate(proposal.proposal_date)}
          </div>
        </div>

        <span className={`${styles.status} ${styles[statusKey]}`}>
          <span className={styles.statusDot} />
          {proposal.status}
        </span>
      </div>

      {/* ADDRESS SECTION */}
      <div className="row g-4 mt-3">
        <div className="col-md-6">
          <div className={styles.infoCard}>
            <div className={styles.infoTitle}>Billing Address</div>
            <p className={styles.infoText}>
              {proposal.billing_address}
            </p>
          </div>
        </div>

        <div className="col-md-6">
          <div className={styles.infoCard}>
            <div className={styles.infoTitle}>Shipping Address</div>
            <p className={styles.infoText}>
              {proposal.shipping_address}
            </p>
          </div>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className={`${styles.sectionCard} mt-4`}>
        <h6 className={styles.sectionTitle}>Proposed Items</h6>

        <div className="table-responsive mt-2">
          <table className={`table ${styles.customTable}`}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th className="text-center">HSN</th>
                <th className="text-center">Qty</th>
                <th className="text-end">Rate</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((i, idx) => (
                <tr key={idx}>
                  <td>
                    {i.featured_image ? (
                      <img
                        src={i.featured_image}
                        alt={i.description}
                        className={styles.productImg}
                      />
                    ) : (
                      <div className={styles.noImg}>—</div>
                    )}
                  </td>

                  <td className={styles.productName}>
                    {i.description}
                  </td>

                  <td className="text-center">{i.hsn || "—"}</td>
                  <td className="text-center">{i.qty}</td>
                  <td className="text-end">
                    ₹ {Number(i.rate).toLocaleString()}
                  </td>
                  <td className="text-end fw-semibold">
                    ₹ {Number(i.total).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUMMARY + ACTIONS */}
      <div className="row mt-4">
        <div className="col-md-7"></div>

        <div className="col-md-5">
          <div className={styles.summaryBox}>
            <h6 className={styles.sectionTitle}>Payment Summary</h6>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹ {Number(data.totals.subtotal).toLocaleString()}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>CGST</span>
              <span>₹ {Number(proposal.cgst_total).toLocaleString()}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>SGST</span>
              <span>₹ {Number(proposal.sgst_total).toLocaleString()}</span>
            </div>

            {Number(proposal.igst_total) > 0 && (
              <div className={styles.summaryRow}>
                <span>IGST</span>
                <span>₹ {Number(proposal.igst_total).toLocaleString()}</span>
              </div>
            )}

            <hr />

            <div className={`${styles.summaryRow} `}>
              <span>Grand Total</span>
              <span>
                ₹ {(Number(data.totals.subtotal) + Number(data.totals.totalTax)).toLocaleString()}
              </span>
            </div>

            <button
              className={styles.actionBtn}
              onClick={() =>
                window.open(
                  `/api/client/proposal-download/${selectedRfq}`,
                  "_blank"
                )
              }
            >
              Download Proposal PDF
            </button>

            {["Sent", "Pending"].includes(proposal.status) && (
              <div className={styles.actionRow}>
                <button
                  className={styles.approveBtn}
                  disabled={actionLoading}
                  onClick={() => updateStatus("Approved")}
                >
                  Approve
                </button>

                <button
                  className={styles.rejectBtn}
                  disabled={actionLoading}
                  onClick={() => updateStatus("Rejected")}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )}
</div>

  );
}
