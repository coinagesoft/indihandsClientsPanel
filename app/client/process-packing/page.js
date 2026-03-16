"use client";
import React from "react";
import useAuthGuard from "../hooks/useAuthGuard";
import styles from "./processPacking.module.css";
import css from "../Footer/Footer.module.css";
import { useRouter } from "next/navigation";
const Page = () => {

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
  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.dashboardCanvas} />

  <div className="d-flex justify-content-between">
      <div className="pageTitle">Process of Packing</div>
         <div>
            <button className='logoutBtn me-5 ' onClick={handleLogout}>
          Logout
        </button>

         </div>

      </div>
      {/* FIRST ROW */}
      <div className={styles.row}>

        <div className={styles.step}>
          <img src="/images/packing4.jpeg"/>
          <span className={styles.arrow}></span>
        </div>

        <div className={styles.step}>
          <img src="/images/packing3.jpeg"/>
          <span className={styles.arrow}></span>
        </div>

        <div className={styles.step}>
          <img src="/images/packing1.jpeg"/>
          <span className={styles.arrow}></span>
        </div>

        <div className={styles.step}>
          <img src="/images/packing2.jpeg"/>
        </div>

      </div>


      {/* SECOND ROW */}
      <div className={styles.row}>

        <div className={styles.step}>
          <img src="/images/packing6.jpeg"/>
          <span className={styles.arrow}></span>
        </div>

        <div className={styles.step}>
          <img src="/images/packing7.jpeg"/>
          <span className={styles.arrow}></span>
        </div>

        <div className={styles.step}>
          <img src="/images/packing7.png"/>
          <span className={styles.arrow}></span>
        </div>

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