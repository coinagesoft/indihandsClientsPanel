"use client";

import { useEffect, useState } from "react";
import styles from "./proposalDetails.module.css";
import PageWrapper from "../../../components/common/wrapper";
import Toast from "../../../components/common/Toast";
import useAuthGuard from "../hooks/useAuthGuard";
import css from "../Footer/Footer.module.css";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import Footer from "../Footer/page";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

export default function ProposalDetailsPage() {
  useAuthGuard();
  const router = useRouter();
  const [rfqs, setRfqs] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [openRfq, setOpenRfq] = useState(null);
  const [proposalData, setProposalData] = useState({});
  const [loadingRfq, setLoadingRfq] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });
  const { cartCount, fetchCartCount } = useCart();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [feedbackForm, setFeedbackForm] = useState({
    rating: null,
    comments: "",
  });
  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [selectedProposal, setSelectedProposal] =
    useState(null);

  const [paymentForm, setPaymentForm] =
    useState({

      fullName: "",

      email: "",

      phone: "",

      billingAddress: "",

      gstin: "",

      companyName: "",
    });

  const handlePayNow = (proposal) => {

    setSelectedProposal(proposal);

    setPaymentForm({

      fullName: "",

      email: "",

      phone: "",

      billingAddress: "",

      gstin: "",

      companyName: "",
    });

    setShowPaymentModal(true);
  };

  const submitFeedback = async () => {
    const token = localStorage.getItem("client_token");

    const res = await fetch("/api/client/feedback", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            proposalId: selectedProposal.id,
            rating: feedbackForm.rating,
            comments: feedbackForm.comments
        })
    });

    const data = await res.json();

    if (res.ok) {
        showToast("Feedback submitted successfully.");
        setShowFeedbackModal(false);

        setFeedbackForm({
            rating: null,
            comments: ""
        });
    } else {
        showToast(data.message || "Unable to submit feedback", "error");
    }
};
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

  const handleSearch = async (value) => {
    setSearch(value);

    if (!value) {
      setResults([]);
      return;
    }

    try {
      const token = localStorage.getItem("client_token");

      const res = await fetch(
        `/api/client/globalFilter?search=${value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setResults(data.products || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  useEffect(() => {
    fetchCartCount();
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


  const handleLogout = async () => {
    try {
      await fetch("/api/client/auth/logout", { method: "POST" });
    } catch { }

    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    router.push("/login");
  };
  /* ================= APPROVE / REJECT ================= */
  // const updateStatus = async (proposalId, status, rfqId) => {
  //   if (!confirm(`Are you sure you want to ${status} this proposal?`)) return;

  //   const token = localStorage.getItem("client_token");
  //   if (!token) {
  //     showToast("Unauthorized", "error");
  //     return;
  //   }

  //   const actionKey = `${status.toLowerCase()}-${rfqId}`;
  //   setActionLoading(actionKey);

  //   try {
  //     /* 1️⃣ Proposal status update */
  //     const res1 = await fetch("/api/client/proposal-status", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ proposalId, status }),
  //     });

  //     const data1 = await res1.json();

  // // 🔍 DEBUG
  // console.log("=== PROPOSAL STATUS RESPONSE ===", data1);
  // console.log("mailSent:", data1.mailSent);
  // console.log("res1.ok:", res1.ok);
  //     if (!res1.ok) {
  //       showToast("Failed to update proposal", "error");
  //       return;
  //     }

  //     /* 2️⃣ RFQ stock update — ✅ Authorization header added */
  //     const rfqStatus = status === "Approved" ? "Accepted" : "Rejected";

  //     const res2 = await fetch(`/api/client/rfqs/${rfqId}`, {
  //       method: "PATCH",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`, // ✅ was missing
  //       },
  //       body: JSON.stringify({ status: rfqStatus }),
  //     });

  //     if (!res2.ok) {
  //       console.error("❌ RFQ PATCH failed:", await res2.json());
  //     }

  //     /* 3️⃣ Toast */
  //     if (status === "Approved") {
  //       showToast(
  //         data1.mailSent
  //           ? "Proposal approved & email sent ✅"
  //           : "Proposal approved (email failed)",
  //         data1.mailSent ? "success" : "warning"
  //       );
  //     } else {
  //       showToast("Proposal rejected", "warning");
  //     }

  //     await loadProposal(rfqId, true);

  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  const updateStatus = async (proposalId, status, rfqId) => {
    if (!confirm(`Are you sure you want to ${status} this proposal?`)) return;

    const token = localStorage.getItem("client_token");
    if (!token) { showToast("Unauthorized", "error"); return; }

    const actionKey = `${status.toLowerCase()}-${rfqId}`;
    setActionLoading(actionKey);

    try {
      const res1 = await fetch("/api/client/proposal-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ proposalId, status }),
      });

      const data1 = await res1.json();
      if (!res1.ok) { showToast("Failed to update proposal", "error"); return; }

      const rfqStatus = status === "Approved" ? "Accepted" : "Rejected";
      const res2 = await fetch(`/api/client/rfqs/${rfqId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: rfqStatus }),
      });
      if (!res2.ok) console.error("❌ RFQ PATCH failed:", await res2.json());

      const currentRfq = rfqs.find(
        (r) => r.rfq_id === rfqId
      );
      if (status === "Approved") {

        // ✅ Download only for B2B
        if (currentRfq?.rfq_type === "B2B") {

          window.open(
            `/api/client/proposal-download/${proposalId}`,
            "_blank"
          );

        }

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
  const loadRazorpayScript = () => {

    return new Promise((resolve) => {

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const startRazorpayPayment = async () => {

    const loaded =
      await loadRazorpayScript();

    if (!loaded) {
      showToast(
        "Razorpay failed to load",
        "error"
      );
      return;
    }

    const token =
      localStorage.getItem("client_token");

    const res = await fetch(
      "/api/client/payments/create-order",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`
        },

        body: JSON.stringify({

          proposalId:
            selectedProposal.id,

          customerData:
            paymentForm
        })
      }
    );

    const order = await res.json();
    console.log(order);
    const options = {

      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

      amount:
        order.amount,

      currency:
        "INR",

      name:
        "IndiHands",

      description:
        selectedProposal
          .proposal_number,

      order_id:
        order.id,

      handler:
        async function (response) {

          const verifyRes =
            await fetch(
              "/api/client/payments/verify",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${token}`
                },

                body: JSON.stringify({

                  proposalId:
                    selectedProposal.id,

                  razorpay:
                    response,

                  customerData:
                    paymentForm
                })
              }
            );

          const verifyData =
            await verifyRes.json();

          if (verifyData.success) {

            showToast(
              "Payment Successful"
            );

            setShowPaymentModal(false);

            await loadProposal(
              selectedProposal.rfq_id,
              true
            );

          } else {

            showToast(
              "Payment verification failed",
              "error"
            );
          }
        }
    };

    const paymentObject =
      new window.Razorpay(options);

    paymentObject.open();
  };

  // ✅ Auto-load proposals for B2B RFQs once rfqs list is available
  useEffect(() => {
    if (rfqs.length === 0) return;

    rfqs.forEach((rfq) => {
      if (rfq.rfq_type === "B2B" && rfq.proposal_id) {
        loadProposal(rfq.rfq_id);
      }
    });
  }, [rfqs]); // ← runs whenever rfqs updates

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
          <p className="pb-0 mb-0">Proposals sent by the admin will appear here.</p>
        </div>
        <Footer />
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
        <div className={styles.pageContent}>


          <div className="d-flex align-items-center">

            {/* LEFT */}
            <div style={{ minWidth: "220px" }}>
              <h4 className="pageTitle">Proposal Details</h4>
            </div>

            {/* CENTER (SEARCH) */}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div className="global-search">
                <input
                  type="text"
                  placeholder="Search products (name / code)..."
                  className="global-search-input"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />

                {search && (
                  <span
                    className="global-search-clear"
                    onClick={() => {
                      setSearch("");
                      setResults([]);
                    }}
                  >
                    ×
                  </span>
                )}

                {results.length > 0 && (
                  <div className="global-search-dropdown">
                    {results.map((item) => (
                      <div
                        key={item.id}
                        className="global-search-item"
                        onClick={() => {
                          setResults([]);
                          setSearch("");
                          router.push(`/client/products/${item.id}`);
                        }}
                      >
                        <div className="global-search-name">
                          {item.product_name}
                        </div>
                        <div className="global-search-code">
                          Code: {item.barcode || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div
              className="d-flex align-items-center gap-2"
              style={{ minWidth: "250px", justifyContent: "flex-end" }}
            >
              <button
                className="guideBtn"
                onClick={() =>
                  window.open("/indiHands_Client_Portal – User_Guide.pdf", "_blank")
                }
              >
                User Guide
              </button>

              <button className="logoutBtn" onClick={handleLogout}>
                Logout
              </button>

              <div
                className="cartIconBox"
                onClick={() => router.push("/client/quote-cart")}
              >
                <HiOutlineShoppingBag size={18} className="cartIcon" />
                {cartCount > 0 && (
                  <span className="cartBadge">{cartCount}</span>
                )}
              </div>
            </div>

          </div>
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

              const isB2B = rfq.rfq_type === "B2B";


              return (
                <div key={rfq.rfq_id} className={styles.accordionCard}>

                  {/* ================= B2B SIMPLE CARD ================= */}
                  {isB2B ? (
                    <div className={styles.accordionHeader} style={{ cursor: "default" }}>

                      {/* LEFT */}
                      <div>
                        <div className={styles.rfqTitle}>
                          {rfq.rfq_number || `RFQ-${rfq.rfq_id}`}
                        </div>
                        <div className={styles.rfqMeta}>
                          Quotation #{proposal?.proposal_number || "-"}
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="d-flex align-items-center gap-3 flex-wrap">

                        {/* STATUS */}
                        {proposal && (
                          <span className={`${styles.status} ${styles[statusKey]}`}>
                            <span className={styles.statusDot} />
                            {/* ✅ Clean label */}
                            {proposal.status === "Sent" || proposal.status === "Pending"
                              ? "Awaiting Response"
                              : proposal.status}
                          </span>
                        )}

                        {/* DOWNLOAD PROPOSAL */}
                        {/* {proposal?.status !== "Rejected" && (
        <button
          className={`${styles.actionBtn} ${styles.secondaryBtn}`}
          onClick={() =>
            window.open(`/api/client/proposal-download/${rfq.proposal_id}`)
          }
        >
          Download
        </button>
      )} */}

                        {/* DOWNLOAD INVOICE */}
                        {proposal?.payment_status === "Paid" && proposal?.invoice_id && (
                          <a href={`/api/client/invoice/${proposal.invoice_id}`}
                            target="_blank"
                            className={`${styles.actionBtn} ${styles.secondaryBtn} text-decoration-none`}
                          >
                            Download Invoice
                          </a>
                        )}

                        {/* REJECT */}
                        {canTakeAction && (
                          <button
                            className={`${styles.actionBtn} ${styles.rejectBtn}`}
                            disabled={actionLoading === `rejected-${rfq.rfq_id}`}
                            onClick={() => updateStatus(proposal.id, "Rejected", rfq.rfq_id)}
                          >
                            {actionLoading === `rejected-${rfq.rfq_id}`
                              ? <span className={styles.btnLoader}></span>
                              : "Reject"}
                          </button>
                        )}

                        {/* APPROVE */}
                        {canTakeAction && (
                          <button
                            className={`${styles.actionBtn} ${styles.approveBtn}`}
                            disabled={actionLoading === `approved-${rfq.rfq_id}`}
                            onClick={() => updateStatus(proposal.id, "Approved", rfq.rfq_id)}
                          >
                            {actionLoading === `approved-${rfq.rfq_id}`
                              ? <span className={styles.btnLoader}></span>
                              : "Approve"}
                          </button>
                        )}
                        {proposal?.status === "Approved" && (
                          <button
                            className={`${styles.actionBtn} ${styles.secondaryBtn}`}
                            onClick={() => {
                              setSelectedProposal(proposal);

                              setFeedbackForm({
                                rating: null,
                                comments: "",
                              });

                              setShowFeedbackModal(true);
                            }}
                          >
                            Give Feedback
                          </button>
                        )}

                      </div>
                    </div>

                  ) : (

                    <>
                      {/* ================= EXISTING B2C ACCORDION ================= */}


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

                      <div
                        className={`${styles.accordionBody} ${isOpen ? styles.open : ""
                          }`}
                      >
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
                                <div className="col-4"><strong>Client Name : </strong> {proposal.client_name}</div>
                                <div className="col-5"><strong>Client Email : </strong> {proposal.client_email}</div>
                                <div className="col-3"><strong>Client Phone : </strong> {proposal.client_phone}</div>
                                {/* <div><strong>Company:</strong> {proposal.company}</div> */}

                              </div>
                              <br></br>
                              <div className={`${styles.addressBlock} row`}>
                                <div className="col-6">
                                  <strong>Billing : </strong>
                                  {proposal.billing_address}
                                </div>

                                <div className="col-6">
                                  <strong>Shipping :  </strong>
                                  {proposal.shipping_address}
                                </div>
                              </div>
                              {proposal.gstin && (
                                <div><strong>GSTIN : </strong> {proposal.gstin}</div>
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
                              {proposal && (() => {
                                // ✅ calculate tax totals from items
                                const cgstTotal = (data?.items || []).reduce((sum, i) => sum + (i.cgst || 0), 0);
                                const sgstTotal = (data?.items || []).reduce((sum, i) => sum + (i.sgst || 0), 0);
                                const igstTotal = (data?.items || []).reduce((sum, i) => sum + (i.igst || 0), 0);

                                const itemTaxTotal = cgstTotal + sgstTotal + igstTotal;

                                return (
                                  <div className={styles.totalBox}>
                                    <table className={`table ${styles.customTable}`}>
                                      <tbody>

                                        {/* ✅ SUBTOTAL */}
                                        <tr>
                                          <td>Subtotal</td>
                                          <td className="text-end">
                                            ₹ {Number(totals.subtotal || 0).toLocaleString()}
                                          </td>
                                        </tr>

                                        {/* ✅ CGST */}
                                        {cgstTotal > 0 && (
                                          <tr>
                                            <td>CGST</td>
                                            <td className="text-end">
                                              ₹ {cgstTotal.toFixed(2)}
                                            </td>
                                          </tr>
                                        )}

                                        {/* ✅ SGST */}
                                        {sgstTotal > 0 && (
                                          <tr>
                                            <td>SGST</td>
                                            <td className="text-end">
                                              ₹ {sgstTotal.toFixed(2)}
                                            </td>
                                          </tr>
                                        )}

                                        {/* ✅ IGST */}
                                        {igstTotal > 0 && (
                                          <tr>
                                            <td>IGST</td>
                                            <td className="text-end">
                                              ₹ {igstTotal.toFixed(2)}
                                            </td>
                                          </tr>
                                        )}

                                        {/* ✅ TOTAL ITEM TAX */}
                                        {itemTaxTotal > 0 && (
                                          <tr>
                                            <td><strong>Item Tax</strong></td>
                                            <td className="text-end">
                                              ₹ {itemTaxTotal.toFixed(2)}
                                            </td>
                                          </tr>
                                        )}

                                        {/* ✅ CHARGES */}
                                        {totals.chargesAmount > 0 && (
                                          <tr>
                                            <td>Charges</td>
                                            <td className="text-end">
                                              ₹ {Number(totals.chargesAmount).toLocaleString()}
                                            </td>
                                          </tr>
                                        )}

                                        {/* ✅ CHARGES TAX */}
                                        {totals.chargesTax > 0 && (
                                          <tr>
                                            <td>Charges Tax</td>
                                            <td className="text-end">
                                              ₹ {Number(totals.chargesTax).toLocaleString()}
                                            </td>
                                          </tr>
                                        )}

                                        {/* ✅ GRAND TOTAL */}
                                        <tr className={styles.grandTotalRow}>
                                          <th>Grand Total</th>
                                          <th className="text-end">
                                            ₹ {Number(totals.grandTotal || 0).toLocaleString()}
                                          </th>
                                        </tr>

                                      </tbody>
                                    </table>
                                  </div>
                                );
                              })()}

                              {/* ================= ACTION BAR ================= */}
                              <div className={styles.actionBar}>

                                {
                                  proposal.payment_status === "Paid" &&
                                  proposal.invoice_id && (

                                    <a
                                      href={`/api/client/invoice/${proposal.invoice_id}`}
                                      target="_blank"
                                      className={`${styles.actionBtn} ${styles.secondaryBtn} text-decoration-none`}
                                    >
                                      Download Invoice
                                    </a>
                                  )
                                }

                                {proposal.rfq_type === "B2C" &&
                                  proposal.status === "Approved" &&
                                  proposal.payment_status !== "Paid" && (

                                    <button
                                      className={`${styles.actionBtn} ${styles.secondaryBtn}`}
                                      onClick={() =>
                                        handlePayNow({
                                          ...proposal,

                                          grandTotal:
                                            totals.grandTotal
                                        })
                                      }
                                    >
                                      Pay Now
                                    </button>
                                  )}
                                {proposal?.status !== "Rejected" && (
                                  <button
                                    className={`${styles.actionBtn} ${styles.secondaryBtn}`}
                                    onClick={() =>
                                      window.open(`/api/client/proposal-download/${rfq.proposal_id}`)
                                    }
                                  >
                                    Download Proposal
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

                                {proposal?.status === "Approved" && (
                                  <button
                                    className={`${styles.actionBtn} ${styles.secondaryBtn}`}
                                    onClick={() => {
                                      setSelectedProposal(proposal);

                                      setFeedbackForm({
                                        rating: null,
                                        comments: "",
                                      });

                                      setShowFeedbackModal(true);
                                    }}
                                  >
                                    Give Feedback
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {showPaymentModal && (

          <div className={styles.paymentOverlay}>

            <div className={styles.paymentModal}>
              <button
                className={styles.closeBtn}
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>

              <h4 className="mb-3">
                Complete Payment
              </h4>

              <input
                className="form-control mb-2"
                placeholder="Full Name"
                value={paymentForm.fullName}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    fullName: e.target.value
                  })
                }
              />

              <input
                className="form-control mb-2"
                placeholder="Email"
                value={paymentForm.email}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    email: e.target.value
                  })
                }
              />

              <input
                className="form-control mb-2"
                placeholder="Phone"
                value={paymentForm.phone}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    phone: e.target.value
                  })
                }
              />
              <input
                className="form-control mb-2"
                placeholder="Company Name"
                value={paymentForm.companyName}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    companyName: e.target.value
                  })
                }
              />
              <textarea
                className="form-control mb-2"
                placeholder="Billing Address"
                value={paymentForm.billingAddress}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    billingAddress: e.target.value
                  })
                }
              />
              <input
                className="form-control mb-2"
                placeholder="GSTIN (Optional)"
                value={paymentForm.gstin}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    gstin: e.target.value
                  })
                }
              />
              <button
                className={` ${styles.secondaryBtn} w-100 text-center`}
                onClick={startRazorpayPayment}
                disabled={actionLoading === "payment"}
              >
                {actionLoading === "payment" ? "Processing..." : "Proceed To Pay"}
              </button>

              <button
                className="btn btn-light w-100 mt-2"
                onClick={() =>
                  setShowPaymentModal(false)
                }
              >
                Cancel
              </button>

            </div>

          </div>
        )}

        {showFeedbackModal && (
          <div className={styles.feedbackOverlay}>
            <div className={styles.feedbackModal}>

              <button
                className={styles.closeBtn}
                onClick={() => {

                  // setSelectedProposal(proposal);

                  setFeedbackForm({
                    rating: null,
                    comments: ""
                  });

                  setShowFeedbackModal(false);
                }}
              >
                ×
              </button>

              <h3 className="mb-2 text-center">
                Share Your Feedback
              </h3>

              <p className="text-center mb-4">
                How was your overall experience?
              </p>

              {/* Rating */}

              <div className={styles.ratingContainer}>

                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.emojiBtn} ${feedbackForm.rating === value
                      ? styles.activeEmoji
                      : ""
                      }`}
                    onClick={() =>
                      setFeedbackForm({
                        ...feedbackForm,
                        rating: value
                      })
                    }
                  >
                    {value === 1 && "😡"}
                    {value === 2 && "🙁"}
                    {value === 3 && "😐"}
                    {value === 4 && "🙂"}
                    {value === 5 && "😍"}
                  </button>
                ))}

              </div>

              <textarea
                rows={5}
                className="form-control mt-4"
                placeholder="Write your feedback (optional)"
                value={feedbackForm.comments}
                onChange={(e) =>
                  setFeedbackForm({
                    ...feedbackForm,
                    comments: e.target.value
                  })
                }
              />

              <div className="d-flex justify-content-center mt-4">
                <button
                  type="button"
                  className={styles.approveBtn}
                  onClick={submitFeedback}
                  style={{
                    minWidth: "220px",
                    height: "46px",
                  }}
                >
                  Submit Feedback
                </button>
              </div>

            </div>
          </div>
        )}
        <footer className={`${css.proposalDetails_Footer} `}>

          <div className={css.designLayer}></div>

          <img
            src="/images/trilogo.png"
            alt="IndiHands"
            className={css.logo}
          />

          <div className={css.text}>
            ©2026 | indiHands | www.indihands.com
          </div>

        </footer>
      </div>

    </PageWrapper>
  );
}
