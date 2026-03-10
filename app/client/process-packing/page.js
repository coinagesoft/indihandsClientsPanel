"use client";
import React from "react";
import useAuthGuard from "../hooks/useAuthGuard";
import styles from "./processPacking.module.css";
import css from "../Footer/Footer.module.css";
const Page = () => {

  useAuthGuard();

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.dashboardCanvas} />

      <div className="pageTitle">Process of Packing</div>

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