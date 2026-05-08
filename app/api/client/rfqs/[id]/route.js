import { db } from "../../../../db";
import { verifyToken } from "../../../../lib/auth"; // ✅ add this

export async function PATCH(req, { params }) {
  try {
    // ✅ verify token first
    try {
      verifyToken(req);
    } catch {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!id || !status)
      return Response.json({ message: "Invalid request" }, { status: 400 });

    const [[rfq]] = await db.query(
      `SELECT status FROM rfqs WHERE id=?`, [id]
    );

    if (!rfq)
      return Response.json({ message: "RFQ not found" }, { status: 404 });

    const prevStatus = rfq.status;

    const [items] = await db.query(
      `SELECT product_id, quantity FROM rfq_products WHERE rfq_id=?`, [id]
    );

    if (prevStatus === "Accepted" && status === "Rejected") {
      for (const it of items) {
        await db.query(
          `UPDATE products SET stock_qty = stock_qty + ? WHERE id=?`,
          [it.quantity, it.product_id]
        );
      }
    }

    if (prevStatus !== "Accepted" && status === "Accepted") {
      for (const it of items) {
        await db.query(
          `UPDATE products SET stock_qty = stock_qty - ? WHERE id=?`,
          [it.quantity, it.product_id]
        );
      }
    }

    await db.query(`UPDATE rfqs SET status=? WHERE id=?`, [status, id]);

    return Response.json({ success: true });

  } catch (e) {
    console.error("RFQ PATCH ERROR:", e);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}