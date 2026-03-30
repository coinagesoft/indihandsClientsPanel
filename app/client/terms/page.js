"use client";
import React from "react";
import useAuthGuard from "../hooks/useAuthGuard";
import styles from "./terms.module.css";
import css from "../Footer/Footer.module.css";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";

const Page = () => {

  useAuthGuard();
  const router = useRouter();
  const { cartCount, fetchCartCount } = useCart();
  const handleLogout = async () => {
    try {
      await fetch("/api/client/auth/logout", { method: "POST" });
    } catch { }

    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    router.push("/login");
  };

  return (
    <div className={` ${styles.dashboardWrapper} container-fluid`} >
      <div className={styles.dashboardCanvas} />
      <div className="d-flex justify-content-between">
        <div className="pageTitle">
          Terms & Conditions
        </div>
        <div className="d-flex align-items-start gap-1">

          {/* LOGOUT */}
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

      <footer className={`${css.terms_Footer} `}>

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
  );
};

export default Page;