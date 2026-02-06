"use client";

import { useEffect, useState } from "react";
import styles from "./proposalDetails.module.css";

export default function ProposalDetailsPage() {
  const [rfqs, setRfqs] = useState([]);
  const [openRfq, setOpenRfq] = useState(null);
  const [proposalData, setProposalData] = useState({});
  const [loadingRfq, setLoadingRfq] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  /* ================= RFQ LIST ================= */
useEffect(() => {
  const token = localStorage.getItem("client_token");
  if (!token) {
    setRfqs([]);
    return;
  }

  fetch("/api/client/rfqs-with-proposals", {
    headers: {
      Authorization: `Bearer ${token}`, 
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then(data => setRfqs(Array.isArray(data) ? data : []))
    .catch(() => setRfqs([]));
}, []);


  /* ================= LOAD PROPOSAL ================= */
 const loadProposal = async (rfqId, force = false) => {
  if (proposalData[rfqId] && !force) return;

  const token = localStorage.getItem("client_token");
  if (!token) return;

  setLoadingRfq(rfqId);

  const res = await fetch(`/api/client/proposal-by-rfq/${rfqId}`, {
    headers: {
      Authorization: `Bearer ${token}`, // 🔥 REQUIRED
    },
  });

  const data = await res.json();

  setProposalData(prev => ({
    ...prev,
    [rfqId]: data,
  }));

  setLoadingRfq(null);
};


  /* ================= APPROVE / REJECT ================= */
 const updateStatus = async (proposalId, status, rfqId) => {
  if (!confirm(`Are you sure you want to ${status} this proposal?`)) return;

  const token = localStorage.getItem("client_token");
  if (!token) {
    alert("Unauthorized");
    return;
  }

  try {
    setActionLoading(true);

    const res = await fetch("/api/client/proposal-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // 🔥 REQUIRED
      },
      body: JSON.stringify({ proposalId, status }),
    });

    if (!res.ok) {
      alert("Failed to update status");
      return;
    }

    // 🔄 Force reload proposal so UI updates immediately
    await loadProposal(rfqId, true);

  } finally {
    setActionLoading(false);
  }
};


  if (rfqs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h5>No Proposal found</h5>
        <p>Your sent proposal will appear here.</p>
      </div>
    );
  }
  
  return (
    <div className={`${styles.dashboardWrapper} container-fluid `}>
      <div className={styles.dashboardCanvas} />

      <h4 className='pageTitle'>Proposal Details</h4>

      <div className="mt-4">
        {rfqs.map(rfq => {
          const isOpen = openRfq === rfq.rfq_id;
          const data = proposalData[rfq.rfq_id];
          const proposal = data?.proposal;

          const statusKey =
            proposal?.status?.toLowerCase()?.replace(/\s+/g, "") || "";

          const canTakeAction =
            proposal && ["Pending", "Sent"].includes(proposal.status);

          return (
            <div key={rfq.rfq_id} className={styles.accordionCard}>
              {/* ================= HEADER ================= */}
              <div
                className={styles.accordionHeader}
                onClick={() => {
                  setOpenRfq(isOpen ? null : rfq.rfq_id);
                  if (!isOpen) loadProposal(rfq.rfq_id);
                }}
              >
                <div>
                  <div className={styles.rfqTitle}>RFQ-{rfq.rfq_id}</div>
                  <div className={styles.rfqMeta}>
                    {rfq.proposal_id
                      ? "Proposal Sent"
                      : "Waiting for Proposal"}
                  </div>
                </div>

                <div className={styles.headerRight}>
                  {proposal && (
                    <span className={`${styles.status} ${styles[statusKey]}`}>
                      <span className={styles.statusDot} />
                      {proposal.status}
                    </span>
                  )}
                  <span
                    className={`${styles.chevron} ${
                      isOpen ? styles.open : ""
                    }`}
                  >
                    ❯
                  </span>
                </div>
              </div>

              {/* ================= BODY ================= */}
              <div
                className={`${styles.accordionBody} ${
                  isOpen ? styles.open : ""
                }`}
              >
                {loadingRfq === rfq.rfq_id && (
                  <div className={styles.loading}>Loading proposal…</div>
                )}

                {!proposal && !loadingRfq && (
                  <div className={styles.emptyState}>
                    Proposal not sent yet
                  </div>
                )}

                {proposal && (
                  <>
                    <div className={styles.proposalMeta}>
                      Proposal #{proposal.proposal_number} •{" "}
                      {new Date(proposal.proposal_date).toLocaleDateString(
                        "en-IN"
                      )}
                    </div>

                    {/* ================= ITEMS TABLE ================= */}
                    <table className={`table ${styles.customTable}`}>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th className="text-center">Qty</th>
                          <th className="text-end">Rate</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.items.map((i, idx) => (
                          <tr key={idx}>
                            <td>{i.description}</td>
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

                    {/* ================= ACTION BAR ================= */}
                    <div className={styles.actionBar}>
                      <button
                        className={`${styles.actionBtn} ${styles.secondaryBtn}`}
                        onClick={() =>
                          window.open(
                            `/api/client/proposal-download/${rfq.rfq_id}`
                          )
                        }
                      >
                        Download PDF
                      </button>

                      {canTakeAction && (
                        <>
                          <button
                            className={`${styles.actionBtn} ${styles.rejectBtn}`}
                            disabled={actionLoading}
                            onClick={() =>
                              updateStatus(
                                proposal.id,
                                "Rejected",
                                rfq.rfq_id
                              )
                            }
                          >
                            Reject
                          </button>

                          <button
                            className={`${styles.actionBtn} ${styles.approveBtn}`}
                            disabled={actionLoading}
                            onClick={() =>
                              updateStatus(
                                proposal.id,
                                "Approved",
                                rfq.rfq_id
                              )
                            }
                          >
                            Approve
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
