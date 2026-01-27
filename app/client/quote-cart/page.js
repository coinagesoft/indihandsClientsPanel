"use client";

import styles from "./quoteCart.module.css";

export default function QuoteCartPage() {
  // dummy data (API later)
  const cartItems = [
    {
      id: 1,
      name: "Kalpavruksha: Handmade A5 Size Jute Diary",
      price: 1343,
      qty: 2,
    },
    {
      id: 2,
      name: "Khaki: Hand-Made Cotton Silk Folder",
      price: 1119,
      qty: 1,
    },
  ];

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <div className="container-fluid">
      {/* Page Title */}
      <div className="row mt-3">
        <div className="col">
          <h4 className={styles.pageTitle}>Quote Cart</h4>
        </div>
      </div>

      {/* Table */}
      <div className="row mt-3">
        <div className="col-lg-9 col-md-12">
          <div className={styles.cartBox}>
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className={styles.productName}>{item.name}</td>
                    <td>₹ {item.price.toLocaleString()}</td>
                    <td>{item.qty}</td>
                    <td>
                      ₹ {(item.price * item.qty).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="col-lg-3 col-md-12 mt-lg-0 mt-3">
          <div className={styles.summaryBox}>
            <h6>Summary</h6>

            <div className={styles.summaryRow}>
              <span>Total Items</span>
              <span>{cartItems.length}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Total Amount</span>
              <span>₹ {totalAmount.toLocaleString()}</span>
            </div>

            <button className={styles.submitBtn}>
              Submit RFQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
