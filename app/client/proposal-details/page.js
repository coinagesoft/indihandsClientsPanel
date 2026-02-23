"use client";

import { useEffect, useState } from "react";
import styles from "./proposalDetails.module.css";
import PageWrapper from "../../../components/common/wrapper";
import Toast from "../../../components/common/Toast";
export default function ProposalDetailsPage() {
  const [rfqs, setRfqs] = useState([]);
  const [openRfq, setOpenRfq] = useState(null);
  const [proposalData, setProposalData] = useState({});
  const [loadingRfq, setLoadingRfq] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };
  /* ================= RFQ LIST ================= */
 useEffect(() => {
  const token = localStorage.getItem("client_token");

  if (!token) {
    setRfqs([]);
    setPageLoading(false);
    setHasFetched(true);
    return;
  }

  fetch("/api/client/rfqs-with-proposals", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(async (res) => {
      if (!res.ok) {
        console.error("RFQ API error:", res.status);
        throw new Error("Unauthorized");
      }
      return res.json();
    })
    .then((data) => {
      console.log("📦 RFQs with proposals response:", data);

      const list =
        Array.isArray(data) ? data :
        Array.isArray(data.rfqs) ? data.rfqs :
        Array.isArray(data.data) ? data.data :
        [];

      setRfqs(list);
    })
    .catch((err) => {
      console.error("❌ RFQ list fetch error:", err);
      setRfqs([]);
    })
    .finally(() => {
      setPageLoading(false);
      setHasFetched(true);
    });
}, []);

  /* ================= LOAD PROPOSAL ================= */
  const loadProposal = async (rfqId, force = false) => {
    if (proposalData[rfqId] && !force) return;

    const token = localStorage.getItem("client_token");
    if (!token) return;

    setLoadingRfq(rfqId);

    try {
      const res = await fetch(`/api/client/proposal-by-rfq/${rfqId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();


      console.log(`📄 Proposal response for RFQ-${rfqId}:`, data); // ✅ LOG

      setProposalData((prev) => ({
        ...prev,
        [rfqId]: data,
      }));
    } catch (err) {
      console.error(`❌ Proposal fetch error for RFQ-${rfqId}:`, err);
    } finally {
      setLoadingRfq(null);
    }
  };

  /* ================= APPROVE / REJECT ================= */
  const updateStatus = async (proposalId, status, rfqId) => {
    if (!confirm(`Are you sure you want to ${status} this proposal?`)) return;

    const token = localStorage.getItem("client_token");
    if (!token) {
      showToast("Unauthorized", "error");
      return;
    }

    const actionKey = `${status.toLowerCase()}-${rfqId}`;
    setActionLoading(actionKey);

    try {
      /* 1️⃣ proposal update */
      const res1 = await fetch("/api/client/proposal-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ proposalId, status }),
      });

      const data1 = await res1.json();

      if (!res1.ok) {
        showToast("Failed to update proposal", "error");
        return;
      }

      /* 2️⃣ RFQ stock */
      const rfqStatus =
        status === "Approved" ? "Accepted" : "Rejected";

      await fetch(`/api/client/rfqs/${rfqId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: rfqStatus }),
      });

      /* 3️⃣ Toast with email info */
      if (status === "Approved") {
        showToast(
          data1.mailSent
            ? "Proposal approved & email sent ✅"
            : "Proposal approved (email failed)",
          data1.mailSent ? "success" : "warning"
        );
      } else {
        showToast("Proposal rejected", "warning");
      }

      await loadProposal(rfqId, true);

    } finally {
      setActionLoading(null);
    }
  };

  /* ================= PAGE-LEVEL LOADER ================= */
  if (pageLoading && !hasFetched) {
    return <PageWrapper loading={true} />;
  }

  /* ================= PAGE-LEVEL EMPTY STATE ================= */
  if (hasFetched && rfqs.length === 0) {
    return (
      <PageWrapper loading={false}>
        <div className={styles.emptyState}>
          <h5>No proposals found</h5>
          <p>Proposals sent by the admin will appear here.</p>
        </div>
      </PageWrapper>
    );
  }

  /* ================= MAIN UI ================= */
  return (

    <PageWrapper loading={false}>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
      <div className={`${styles.dashboardWrapper} container-fluid`}>
        <div className={styles.dashboardCanvas} />

        <h4 className="pageTitle">Proposal Details</h4>

        <div className="mt-4">
          {rfqs.map((rfq) => {
            const isOpen = openRfq === rfq.rfq_id;
            const data = proposalData[rfq.rfq_id];
            const proposal = data?.proposal;

            // ✅ ADD THESE
            const charges = data?.charges || [];
            const totals = data?.totals || {};
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
                    <div className={styles.rfqTitle}>
                      {rfq.rfq_number || `RFQ-${rfq.rfq_id}`}
                    </div>

                    <div className={styles.rfqMeta}>
                      {rfq.proposal_id ? "Proposal Sent" : "Waiting for Proposal"}
                    </div>

                    {proposal && (
                      <div className={styles.clientMini}>
                        {proposal.customerName && (
                          <span>{proposal.customerName}</span>
                        )}
                        {proposal.company && (
                          <span> • {proposal.company}</span>
                        )}
                      </div>
                    )}
                  </div>


                  {/* <div className={styles.headerRight}>
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
                  </div> */}
                  <div className={styles.headerRight}>
                    {proposal && (
                      <>
                        <span className={`${styles.status} ${styles[statusKey]}`}>
                          <span className={styles.statusDot} />
                          {proposal.status}
                        </span>

                        <span
                          className={`${styles.chevron} ${isOpen ? styles.open : ""
                            }`}
                        >
                          ❯
                        </span>
                      </>
                    )}
                  </div>


                </div>

                {/* ================= BODY ================= */}
                <div
                  className={`${styles.accordionBody} ${isOpen ? styles.open : ""
                    }`}
                >
                  {loadingRfq === rfq.rfq_id && (
                    <div className={styles.loading}>
                      Loading proposal…
                    </div>
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
                        {new Date(
                          proposal.proposal_date
                        ).toLocaleDateString("en-IN")}
                      </div>
                      <div className={`${styles.clientBlock} row `}>
                        <div className="col-4"><strong>Client Name:</strong> {proposal.clientName}</div>
                        <div className="col-5"><strong>Client Email:</strong> {proposal.clientEmail}</div>
                        <div className="col-3"><strong>Client Phone:</strong> {proposal.clientPhone}</div>
                        {/* <div><strong>Company:</strong> {proposal.company}</div> */}

                      </div>
                      <br></br>
                      <div className={`${styles.addressBlock} row`}>
                        <div className="col-6">
                          <strong>Billing:</strong>
                          {proposal.billing_address}
                        </div>

                        <div className="col-6">
                          <strong>Shipping:</strong>
                          {proposal.shipping_address}
                        </div>
                      </div>
                      {proposal.gstin && (
                        <div><strong>GSTIN:</strong> {proposal.gstin}</div>
                      )} <br>
                      </br>


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
                          {data?.items?.map((i, idx) => (

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
                      {charges.length > 0 && (
                        <div className={styles.chargesBox}>
                          {/* <h6 className={styles.sectionTitle}>Additional Charges</h6> */}

                          <table className={`table ${styles.customTable}`}>
                            <thead>
                              <tr>
                                <th>Charges</th>
                                <th className="text-end">Amount (incl. tax)</th>
                              </tr>
                            </thead>

                            <tbody>
                              {charges.map((c, i) => {
                                const tax = (c.amount * c.taxPercent) / 100;
                                const total = c.amount + tax;

                                return (
                                  <tr key={i}>
                                    <td>
                                      {c.label}
                                      {c.taxPercent > 0 && (
                                        <div className={styles.taxHint}>
                                          Includes {c.taxPercent}% tax
                                        </div>
                                      )}
                                    </td>

                                    <td className="text-end fw-semibold">
                                      ₹ {total.toLocaleString()}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}


                      {/* ================= ACTION BAR ================= */}
                      <div className={styles.actionBar}>
                        {proposal?.status !== "Rejected" && (
                          <button
                            className={`${styles.actionBtn} ${styles.secondaryBtn}`}
                            onClick={() =>
                              window.open(`/api/client/proposal-download/${rfq.proposal_id}`)
                            }
                          >
                            Download PDF
                          </button>
                        )}

                        {canTakeAction && (
                          <>
                            <button
                              className={`${styles.actionBtn} ${styles.rejectBtn}`}
                              disabled={actionLoading === `rejected-${rfq.rfq_id}`}
                              onClick={() =>
                                updateStatus(proposal.id, "Rejected", rfq.rfq_id)
                              }
                            >
                              {actionLoading === `rejected-${rfq.rfq_id}` ? (
                                <span className={styles.btnLoader}></span>
                              ) : (
                                "Reject"
                              )}
                            </button>

                            <button
                              className={`${styles.actionBtn} ${styles.approveBtn}`}
                              disabled={actionLoading === `approved-${rfq.rfq_id}`}
                              onClick={() =>
                                updateStatus(proposal.id, "Approved", rfq.rfq_id)
                              }
                            >
                              {actionLoading === `approved-${rfq.rfq_id}` ? (
                                <span className={styles.btnLoader}></span>
                              ) : (
                                "Approve"
                              )}
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
    </PageWrapper>
  );
}
