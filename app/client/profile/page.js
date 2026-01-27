"use client";

import styles from "./profile.module.css";

export default function ProfilePage() {
  return (
    <div className="container-fluid">
      {/* Page Title */}
      <div className="row mt-3">
        <div className="col">
          <h4 className={styles.pageTitle}>Company Profile</h4>
        </div>
      </div>

      {/* Main Card */}
      <div className="row mt-3">
        <div className="col-lg-10 col-md-12">
          <div className={styles.profileBox}>
            {/* Company Info */}
            <h6 className={styles.sectionTitle}>Company Information</h6>

            <div className="row g-3">
              <div className="col-md-6">
                <label className={styles.label}>Company Name</label>
                <input className={`form-control ${styles.input}`} />
              </div>

              <div className="col-md-6">
                <label className={styles.label}>GSTIN</label>
                <input className={`form-control ${styles.input}`} />
              </div>
            </div>

            {/* Billing Address */}
            <h6 className={styles.sectionTitle}>Billing Address</h6>

            <div className="row g-3">
              <div className="col-12">
                <textarea
                  rows="3"
                  className={`form-control ${styles.input}`}
                  placeholder="Address"
                />
              </div>

              <div className="col-md-4">
                <input className={`form-control ${styles.input}`} placeholder="City" />
              </div>

              <div className="col-md-4">
                <input className={`form-control ${styles.input}`} placeholder="State" />
              </div>

              <div className="col-md-4">
                <input className={`form-control ${styles.input}`} placeholder="Pincode" />
              </div>
            </div>

            {/* Shipping Address */}
            <h6 className={styles.sectionTitle}>Shipping Addresses</h6>

            <div className="row g-3">
              <div className="col-md-6">
                <input
                  className={`form-control ${styles.input}`}
                  placeholder="Address Card 1"
                />
              </div>

              <div className="col-md-6">
                <input
                  className={`form-control ${styles.input}`}
                  placeholder="Address Card 2"
                />
              </div>

              <div className="col-12">
                <button className={styles.addAddressBtn}>
                  + New Address
                </button>
              </div>
            </div>

            {/* Primary Contact */}
            <h6 className={styles.sectionTitle}>Primary Contact</h6>

            <div className="row g-3">
              <div className="col-md-4">
                <input
                  className={`form-control ${styles.input}`}
                  placeholder="Name"
                />
              </div>

              <div className="col-md-4">
                <input
                  className={`form-control ${styles.input}`}
                  placeholder="Email"
                />
              </div>

              <div className="col-md-4">
                <input
                  className={`form-control ${styles.input}`}
                  placeholder="Phone"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="row mt-4">
              <div className="col text-end">
                <button className={styles.saveBtn}>Save Changes</button>
                <button className={styles.logoutBtn}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
