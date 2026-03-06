"use client";

import Footer from "../../app/client/Footer/page";
import styles from "./Wrapper.module.css";

export default function PageWrapper({ loading, children }) {
  if (loading) {
    return (
      <div className={styles.pageLoader}>
        <img
          src="/images/faviconSidebar.png"   
          alt="Loading"
          className={styles.logoSpinner}
        />
        <span className={styles.loadingText}>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div >
      <div >
        {children}
      </div>

    </div>
    </>
  );
}
