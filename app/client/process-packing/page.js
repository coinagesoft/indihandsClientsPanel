"use client";
import React, { useEffect } from "react";
import useAuthGuard from "../hooks/useAuthGuard";
import styles from "./processPacking.module.css";
import css from "../Footer/Footer.module.css";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
const Page = () => {
const { cartCount, fetchCartCount } = useCart();
  useAuthGuard();
  const router = useRouter();

    const handleLogout = async () => {
    try {
      await fetch("/api/client/auth/logout", { method: "POST" });
    } catch {}

    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    router.push("/login");
  };

 useEffect(() => {
    fetchCartCount();
  }, []);

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.dashboardCanvas} />

  <div className={styles.topBar}>
      <div className="pageTitle">Process of Packing</div>
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
      {/* FIRST ROW */}
      <div className={styles.row}>

        <div className={styles.step}>
          <img src="/images/packing4.jpeg"/>
          <span className={styles.arrow}></span>
        </div>
          <span className={styles.bottomarrow}></span>


        <div className={styles.step}>
          <img src="/images/packing3.jpeg"/>
          <span className={styles.arrow}></span>
        </div>
          <span className={styles.bottomarrow}></span>

        <div className={styles.step}>
          <img src="/images/packing1.jpeg"/>
          <span className={styles.arrow}></span>
        </div>
          <span className={styles.bottomarrow}></span>

        <div className={styles.step}>
          <img src="/images/packing2.jpeg"/>
        </div>
          <span className={styles.bottomarrow}></span>

      </div>


      {/* SECOND ROW */}
      <div className={styles.row}>

        <div className={styles.step}>
          <img src="/images/packing6.jpeg"/>
          <span className={styles.arrow}></span>
        </div>
          <span className={styles.bottomarrow}></span>

        <div className={styles.step}>
          <img src="/images/packing7.jpeg"/>
          <span className={styles.arrow}></span>
        </div>
          <span className={styles.bottomarrow}></span>

        <div className={styles.step}>
          <img src="/images/packing7.png"/>
          <span className={styles.arrow}></span>
        </div>
          <span className={styles.bottomarrow}></span>

        <div className={styles.step}>
          <img src="/images/packing8.png"/>
        </div>

      </div>


      {/* QUOTE */}
      <div className={styles.quote}>

        <span className={styles.qMark}>“</span>

        Every IndiHands product is packed with care, respect for craftsmanship,
        and responsibility towards sustainability.

        <span className={styles.qMark}>”</span>

      </div>
<footer className={`${css.packing_Footer} `}>
      
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