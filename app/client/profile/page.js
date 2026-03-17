"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";
import PageWrapper from "../../../components/common/wrapper";
import useAuthGuard from "../hooks/useAuthGuard";
import css from "../Footer/Footer.module.css";

export default function ProfilePage() {
   useAuthGuard();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [company, setCompany] = useState({
    company_name: "",
    company_email: "",
  });

  const [branchName, setBranchName] = useState("");

  const [billing, setBilling] = useState("");
  const [shipping, setShipping] = useState("");

  const [contact, setContact] = useState({
    name: "",
    emails: [],
    phones: [],
  });

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await fetch("/api/client/auth/logout", { method: "POST" });
    } catch {}

    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    router.push("/login");
  };

  /* ================= FETCH PROFILE ================= */
useEffect(() => {
  const token = localStorage.getItem("client_token");

  fetch("/api/client/company-profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then(data => {
      console.log("profile data:", data);

      // ✅ Company
      setCompany(data.company);

      // ✅ Logged-in branch object
      const branch = data.branch;

      if (branch) {
        setBranchName(branch.branch_name);
        setBilling(branch.billing_address || "");
        setShipping(branch.shipping_address || "");
        setContact(
          branch.primary_contact || {
            name: "",
            emails: [],
            phones: [],
          }
        );
      }
    })
    .catch(err => {
      console.error("Profile fetch error:", err);
    })
    .finally(() => setLoading(false));
}, []);


  /* ================= SAVE ================= */
  const saveProfile = async () => {
    const token = localStorage.getItem("client_token");
    if (!token) return alert("Unauthorized");

    setSaving(true);

    const res = await fetch("/api/client/company-profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        billing_address: billing,
        shipping_address: shipping,
        primary_contact: contact,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      alert("❌ Failed to save profile");
      return;
    }

    alert("✅ Profile updated successfully");
  };



  return (
      <PageWrapper loading={loading}>
    <div className={`${styles.dashboardWrapper} container-fluid   `}>
        {/* <div className={styles.dashboardCanvas} ></div> */}

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="pageTitle">Company Profile</h4>
        {/* <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button> */}
      </div>

      <div className={styles.profileBox}>

        {/* COMPANY INFO */}
        <h6 className={styles.sectionTitle}>Company Information</h6>
        <div className="row g-3">
          <div className="col-md-6">
            <label>Company Name</label>
            <input className="form-control" value={company.company_name} disabled />
          </div>
          <div className="col-md-6">
            <label>Branch</label>
        <input className="form-control" value={branchName} disabled />
          </div>
        </div>

   
        {/* BILLING */}
        <h6 className={styles.sectionTitle}>Billing Address</h6>
        <textarea
          className="form-control"
          rows={3}
          value={billing}
          onChange={e => setBilling(e.target.value)}
        />

        {/* SHIPPING */}
        <h6 className={styles.sectionTitle}>Shipping Address</h6>
        <textarea
          className="form-control"
          rows={3}
          value={shipping}
          onChange={e => setShipping(e.target.value)}
        />

        {/* CONTACT */}
        {/* <h6 className={styles.sectionTitle}>Primary Contact</h6>
        <div className="row g-3">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Name"
              value={contact.name}
              onChange={e => setContact({ ...contact, name: e.target.value })}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Emails (comma separated)"
              value={contact.emails.join(",")}
              onChange={e =>
                setContact({
                  ...contact,
                  emails: e.target.value.split(",").map(v => v.trim()),
                })
              }
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Phones (comma separated)"
              value={contact.phones.join(",")}
              onChange={e =>
                setContact({
                  ...contact,
                  phones: e.target.value.split(",").map(v => v.trim()),
                })
              }
            />
          </div>
        </div> */}

        {/* ACTION */}
        <div className="text-end mt-4">
          <button
            className={styles.saveBtn}
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
   <footer className={`${css.profile_Footer} `}>
      
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
