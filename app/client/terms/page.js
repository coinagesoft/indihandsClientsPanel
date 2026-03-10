"use client";
import React from "react";
import useAuthGuard from "../hooks/useAuthGuard";
import styles from "./terms.module.css";
import Footer from "../Footer/page";

const Page = () => {

  useAuthGuard();

  return (
    <div className={` ${styles.dashboardWrapper} container-fluid`} >
   <div className={styles.dashboardCanvas} />
      <div className="pageTitle">
        Terms & Conditions
      </div>

      <div className={styles.cardGrid}>

        <div className={`${styles.termCard} ${styles.cardWide}`}>
          <h3>Product Description</h3>
          <p>
            As per the approved production sample and/or product specification
            sheet. All products are largely handmade adhering to stringent
            guidelines. Minor variations may occur in the final products due to
            the handmade nature.
          </p>
        </div>

        <div className={styles.termCard}>
          <h3>Price</h3>
          <p>
            The quoted price is inclusive of branding and packaging.
          </p>
        </div>

        <div className={styles.termCard}>
          <h3>Delivery Charges</h3>
          <p>
            Extra, as applicable.
          </p>
        </div>

        <div className={styles.termCard}>
          <h3>Payment Terms</h3>
          <p>
            Payment is due immediately upon delivery.
          </p>
        </div>

        <div className={`${styles.termCard} wp5`}>
          <h3>Order Confirmation</h3>
          <p>
            Orders must be confirmed through formal email.
          </p>
        </div>

        <div className={styles.termCard}>
          <h3>Changes in Product Specifications</h3>
          <p>
            No changes will be accepted once the Purchase Order is signed and sealed.
          </p>
        </div>

        <div className={styles.termCard}>
          <h3>Force Majeure</h3>
          <p>
            This quotation is subject to standard Terms & Conditions of Force Majeure.
          </p>
        </div>

        <div className={styles.termCard}>
          <h3>Jurisdiction</h3>
          <p>
            All dealings related to this quotation are subject to the jurisdiction of courts in Pune.
          </p>
        </div>

      </div>

      <div className={styles.note}>
        <b>Note:</b> The above terms and prices are subject to change with prior notice.Please review and confirm accordingly.
      </div>

      <Footer/>

    </div>
  );
};

export default Page;