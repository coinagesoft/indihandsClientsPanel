"use client";

import PageWrapper from "../../../components/common/wrapper";
import styles from "./processPacking.module.css";

export default function ProcessPackingPage() {
  const steps = [
    {
      title: "Order Confirmation",
      desc: "Once your order is placed, our team verifies specifications and confirms the request.",
    },
    {
      title: "Artisan Crafting",
      desc: "Products are carefully handcrafted by skilled artisans using traditional techniques.",
    },
    {
      title: "Quality Check",
      desc: "Each item goes through a detailed quality inspection to ensure premium standards.",
    },
    {
      title: "Eco-Friendly Packing",
      desc: "We use sustainable, plastic-free packaging to protect both products and nature.",
    },
    {
      title: "Secure Dispatch",
      desc: "Orders are securely packed and dispatched with reliable logistics partners.",
    },
  ];

  return (
  <PageWrapper>

    <div className={`${styles.dashboardWrapper} container-fluid  `}>
      <div className={styles.dashboardCanvas} ></div>
      {/* Page Header */}
    
          <h4 className='pageTitle '>Process of Packing</h4>
          <p className={styles.subTitle}>
            From artisan hands to your workspace — carefully packed at every step
          </p>
    

      {/* Steps */}
      <div className="row mt-4 g-4">
        {steps.map((step, index) => (
          <div key={index} className="col-lg-4 col-md-6">
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>{index + 1}</div>
              <h6 className={styles.stepTitle}>{step.title}</h6>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Note */}
      <div className="row mb-5 mt-5">
        <div className="col-lg-10 mb-5">
          <div className={styles.noteBox}>
            Every IndiHands product is packed with care, respect for craftsmanship,
            and responsibility towards sustainability.
          </div>
        </div>
      </div>
    </div>
    </PageWrapper>
  );
}
