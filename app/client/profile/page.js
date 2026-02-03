"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [company, setCompany] = useState({
    company_name: "",
    company_email: "",
  });

  const [branches, setBranches] = useState([]);
  const [activeBranchId, setActiveBranchId] = useState(null);

  const [billing, setBilling] = useState("");
  const [shipping, setShipping] = useState("");

  const [contact, setContact] = useState({
    name: "",
    emails: [],
    phones: [],
  });

const handleLogout = async () => {
  try {
    await fetch("/api/client/auth/logout", {
      method: "POST",
    });
  } catch (e) {
    console.error("Logout API error", e);
  }

  // ✅ CLEAR LOCAL STORAGE
  localStorage.removeItem("client_token");
  localStorage.removeItem("client_user");

  // ✅ REDIRECT TO LOGIN
  router.push("/login");
};


  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    fetch("/api/client/company-profile")
      .then(res => res.json())
      .then(data => {
        if (!data?.company) return;

        setCompany(data.company);
        setBranches(data.branches || []);

        if (data.branches?.length) {
          loadBranch(data.branches[0]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const loadBranch = (branch) => {
    if (!branch) return;

    setActiveBranchId(branch.id);
    setBilling(branch.billing_address || "");
    setShipping(branch.shipping_address || "");
    setContact(branch.primary_contact || {
      name: "",
      emails: [],
      phones: [],
    });
  };

  /* ================= SAVE ================= */
  const saveProfile = async () => {
    if (!activeBranchId) return;

    setSaving(true);

    const res = await fetch("/api/client/company-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branch_id: activeBranchId,
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

    alert("✅ Branch profile updated successfully");
  };

  if (loading) {
    return <div className="text-center mt-5">Loading company profile...</div>;
  }

  return (
    <div className="container-fluid py-5">

      {/* ===== HEADER WITH LOGOUT ===== */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className={styles.pageTitle}>Company Profile</h4>

        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className="col-lg-12">
        <div className={styles.profileBox}>

          {/* COMPANY INFO */}
          <h6 className={styles.sectionTitle}>Company Information</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label>Company Name</label>
              <input
                className="form-control"
                value={company.company_name}
                disabled
              />
            </div>

            <div className="col-md-6">
              <label>Company Email</label>
              <input
                className="form-control"
                value={company.company_email}
                disabled
              />
            </div>
          </div>

          {/* BRANCH SELECT */}
          <h6 className={styles.sectionTitle}>Select Branch</h6>
          <select
            className="form-select"
            value={activeBranchId || ""}
            onChange={(e) => {
              const branch = branches.find(
                b => b.id == e.target.value
              );
              loadBranch(branch);
            }}
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.branch_name}
              </option>
            ))}
          </select>

          {/* BILLING */}
          <h6 className={styles.sectionTitle}>
            Billing Address (Branch)
          </h6>
          <textarea
            className="form-control"
            rows={3}
            value={billing}
            onChange={e => setBilling(e.target.value)}
          />

          {/* SHIPPING */}
          <h6 className={styles.sectionTitle}>
            Shipping Address (Branch)
          </h6>
          <textarea
            className="form-control"
            rows={3}
            value={shipping}
            onChange={e => setShipping(e.target.value)}
          />

          {/* CONTACT */}
          <h6 className={styles.sectionTitle}>
            Primary Contact (Branch)
          </h6>
          <div className="row g-3">
            <div className="col-md-4">
              <input
                className="form-control"
                placeholder="Contact Name"
                value={contact.name}
                onChange={e =>
                  setContact({ ...contact, name: e.target.value })
                }
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
                    emails: e.target.value
                      .split(",")
                      .map(v => v.trim()),
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
                    phones: e.target.value
                      .split(",")
                      .map(v => v.trim()),
                  })
                }
              />
            </div>
          </div>

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
      </div>
    </div>
  );
}
