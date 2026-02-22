import { db } from "../../../../db";

export async function PATCH(req, { params }) {
  try {
 const { id } =await params;
    const { status } = await req.json();

    if (!id || !status)
      return Response.json({ message: "Invalid request" }, { status: 400 });

    /* ---------- GET CURRENT STATUS ---------- */
    const [[rfq]] = await db.query(
      `SELECT status FROM rfqs WHERE id=?`,
      [id]
    );

    if (!rfq)
      return Response.json({ message: "RFQ not found" }, { status: 404 });

    const prevStatus = rfq.status;

    /* ---------- GET RFQ PRODUCTS ---------- */
    const [items] = await db.query(
      `SELECT product_id, quantity FROM rfq_products WHERE rfq_id=?`,
      [id]
    );

    /* ---------- STOCK LOGIC ---------- */

    // Accepted → Rejected → restore stock
    if (prevStatus === "Accepted" && status === "Rejected") {
      for (const it of items) {
        await db.query(
          `UPDATE products 
           SET stock_qty = stock_qty + ? 
           WHERE id=?`,
          [it.quantity, it.product_id]
        );
      }
    }

    // not accepted → Accepted → reduce stock
    if (prevStatus !== "Accepted" && status === "Accepted") {
      for (const it of items) {
        await db.query(
          `UPDATE products 
           SET stock_qty = stock_qty - ? 
           WHERE id=?`,
          [it.quantity, it.product_id]
        );
      }
    }

    /* ---------- UPDATE STATUS ---------- */
    await db.query(
      `UPDATE rfqs SET status=? WHERE id=?`,
      [status, id]
    );

    return Response.json({ success: true });

  } catch (e) {
    console.error(e);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}