"use client";
import React from "react";
import useAuthGuard from "../hooks/useAuthGuard";
import styles from "./contactus.module.css";
import css from "../Footer/Footer.module.css";
const Page = () => {

  useAuthGuard();
      const handleLogout = async () => {
    try {
      await fetch("/api/client/auth/logout", { method: "POST" });
    } catch {}

    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
    router.push("/login");
  };
const phone = "+919822513937";
const email = "manik@mtds.co.in";
const website = "https://www.indihands.com";
  return (
   <>

    <div className={`${styles.dashboardWrapper} container-fluid`}>
      <div className={styles.dashboardCanvas} />

       <div className="d-flex justify-content-between">
      <div className="pageTitle">
        Contact Us
      </div>
         <div>
            <button className='logoutBtn me-5 ' onClick={handleLogout}>
          Logout
        </button>

         </div>

      </div>

      <div className={styles.contactContainer}>

        <div className={styles.contactRow}>

          <img
            src="/images/favicon.png"
            className={styles.contactLogo}
          />

          <div className={styles.address}>
            Manik Trifaley Design Studio,<br/>
            303, Meghana, DSK Ranwara, NDA-Pashan Road,<br/>
            Bavdhan, Pune - 411021. India
          </div>

        </div>

       <div className={styles.contactLine}>
  <a href={`tel:${phone}`} className={styles.link}>
    {phone}
  </a>

  <span className={styles.line}></span>

  <a href={`mailto:${email}`} className={styles.link}>
    {email}
  </a>

  <span className={styles.line}></span>

  <a href={website} target="_blank" rel="noopener noreferrer" className={styles.link}>
    {website.replace("https://", "")}
  </a>
</div>

        <div className={styles.decorLine}>

      <img
        src="/images/line_design.jpeg"
        alt="IndiHands"
        className={styles.linedesign}
      />       
       </div>

      </div>

 <footer className={`${css.contactus_Footer} `}>
      
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

     
    </>
  );
};

export default Page;