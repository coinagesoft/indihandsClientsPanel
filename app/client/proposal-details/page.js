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

  /* ================= RFQ LIST ================= */
  useEffect(() => {
    const token = localStorage.getItem("client_token");
    if (!token) {
      setRfqs([]);
      setPageLoading(false); // ✅ stop page loader
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
      .then((data) => setRfqs(Array.isArray(data) ? data : []))
      .catch(() => setRfqs([]))
      .finally(() => setPageLoading(false)); // ✅ always stop
  }, []);

  /* ================= LOAD PROPOSAL ================= */
  const loadProposal = async (rfqId, force = false) => {
    if (proposalData[rfqId] && !force) return;

    const token = localStorage.getItem("client_token");
    if (!token) return;

    setLoadingRfq(rfqId); // row loader only

    const res = await fetch(`/api/client/proposal-by-rfq/${rfqId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    setProposalData((prev) => ({
      ...prev,
      [rfqId]: data,
    }));

    setLoadingRfq(null);
  };

  /* ================= APPROVE / REJECT ================= */
  const updateStatus = async (proposalId, status, rfqId) => {
    if (!confirm(`Are you sure you want to ${status} this proposal?`)) return;

    const token = localStorage.getItem("client_token");
    if (!token) return;

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

      if (!res.ok) return;

      await loadProposal(rfqId, true); // refresh
    } finally {
      setActionLoading(false);
    }
  };

  /* ✅ PAGE-LEVEL EMPTY STATE */
  if (!pageLoading && rfqs.length === 0) {
    return (
      <PageWrapper loading={false}>
        <div className={styles.emptyState}>
          <h5>No Proposal found</h5>
          <p>Your sent proposal will appear here.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper loading={pageLoading}>
      <div className={`${styles.dashboardWrapper} container-fluid`}>
        <div className={styles.dashboardCanvas} />

        <h4 className="pageTitle">Proposal Details</h4>

        <div className="mt-4">
          {rfqs.map((rfq) => {
            const isOpen = openRfq === rfq.rfq_id;
            const data = proposalData[rfq.rfq_id];
            const proposal = data?.proposal;

            const statusKey =
              proposal?.status?.toLowerCase()?.replace(/\s+/g, "") || "";

            const canTakeAction =
              proposal && ["Pending", "Sent"].includes(proposal.status);

            return (
              <div key={rfq.rfq_id} className={styles.accordionCard}>
                {/* HEADER */}
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

                {/* BODY */}
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
                      {/* same table + actions as before */}
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
