"use client";

import { useEffect, useState } from "react";
import styles from "./proposalDetails.module.css";
import PageWrapper from "../../../components/common/wrapper";

export default function ProposalDetailsPage() {
  const [rfqs, setRfqs] = useState([]);
  const [openRfq, setOpenRfq] = useState(null);
  const [proposalData, setProposalData] = useState({});
  const [loadingRfq, setLoadingRfq] = useState(null);     // row-level
  const [actionLoading, setActionLoading] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);   // ✅ ADD
  const [hasFetched, setHasFetched] = useState(false);    // ✅ ADD

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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        console.log("📦 RFQs with proposals response:", data); // ✅ LOG
        setRfqs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("❌ RFQ list fetch error:", err);
        setRfqs([]);
      })
      .finally(() => {
        setPageLoading(false);
        setHasFetched(true); // ✅ mark fetch completed
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
      alert("Unauthorized");
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetch("/api/client/proposal-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ proposalId, status }),
      });

      const data = await res.json();
      console.log("🔄 Proposal status update response:", data); // ✅ LOG

      if (!res.ok) {
        alert("Failed to update status");
        return;
      }

      await loadProposal(rfqId, true); // refresh proposal
    } finally {
      setActionLoading(false);
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
        className={`${styles.chevron} ${
          isOpen ? styles.open : ""
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
                  className={`${styles.accordionBody} ${
                    isOpen ? styles.open : ""
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
<div className={`${styles.addressBlock} row` }>
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
    </PageWrapper>
  );
}
