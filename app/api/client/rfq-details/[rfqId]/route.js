import { NextResponse } from "next/server";
import { db } from "../../../../db";
import { verifyToken } from "../../../../lib/auth";


export async function GET(req, { params }) {
  try {
    /* ✅ params destructure (NO await) */
    const { rfqId } =await params;
    const rfq_id = Number(rfqId);

    if (!rfq_id) {
      return NextResponse.json(
        { error: "Invalid RFQ id" },
        { status: 400 }
      );
    }

    /* ===== AUTH ===== */
    let decoded;
    try {
      decoded = verifyToken(req);
    } catch (err) {
      console.error("Auth error:", err.message);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { companyId, branchId } = decoded;

    /* ===== RFQ HEADER ===== */
    const [[rfq]] = await db.query(
      `
      SELECT
        id,
        rfq_number,
        status,
        submitted_at,
        notes,

        client_name,
        client_phone,
        client_email

      FROM rfqs
      WHERE id = ?
        AND company_id = ?
        AND branch_id = ?
      LIMIT 1
      `,
      [rfq_id, companyId, branchId]
    );

    if (!rfq) {
      return NextResponse.json(
        { error: "RFQ not found" },
        { status: 404 }
      );
    }

    /* ===== RFQ PRODUCTS ===== */
    const [items] = await db.query(
      `
      SELECT
        p.product_name,
        rp.quantity,
        rp.quoted_price,
        (rp.quantity * rp.quoted_price) AS total
      FROM rfq_products rp
      JOIN products p ON p.id = rp.product_id
      WHERE rp.rfq_id = ?
      `,
      [rfq_id]
    );

    return NextResponse.json({
      rfq: {
        ...rfq,
        total_items: items.length,
      },
      items,
    });

  } catch (error) {
    console.error("RFQ Details API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch RFQ details" },
      { status: 500 }
    );
  }
}



