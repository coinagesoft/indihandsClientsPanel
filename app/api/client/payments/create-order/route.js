import Razorpay from "razorpay";
import db from "../../../../db";

const razorpay =
  new Razorpay({

    key_id:
      process.env.RAZORPAY_KEY_ID,

    key_secret:
      process.env.RAZORPAY_KEY_SECRET,
  });

export async function POST(req) {

  try {

    const body =
      await req.json();

    const proposalId =
      Number(body.proposalId);

    if (!proposalId) {

      return Response.json(
        {
          error:
            "Invalid proposal"
        },
        {
          status: 400
        }
      );
    }

    /* ================= FETCH TOTAL ================= */

 const [[proposal]] =
  await db.query(
    `
    SELECT

      (
        IFNULL(it.subtotal,0)

        + IFNULL(it.cgst,0)

        + IFNULL(it.sgst,0)

        + IFNULL(it.igst,0)

        + IFNULL(ch.amount,0)

        + IFNULL(ch.tax,0)

      ) AS grand_total

    FROM proposals p

    /* ===== ITEMS ===== */

    LEFT JOIN (
      SELECT

        proposal_id,

        SUM(quantity * rate)
          AS subtotal,

        SUM(
          (quantity * rate)
          * cgst_rate / 100
        ) AS cgst,

        SUM(
          (quantity * rate)
          * sgst_rate / 100
        ) AS sgst,

        SUM(
          (quantity * rate)
          * igst_rate / 100
        ) AS igst

      FROM proposal_items

      GROUP BY proposal_id

    ) it
      ON it.proposal_id = p.id

    /* ===== CHARGES ===== */

    LEFT JOIN (
      SELECT

        proposal_id,

        SUM(amount)
          AS amount,

        SUM(
          amount * tax_percent / 100
        ) AS tax

      FROM proposal_charges

      GROUP BY proposal_id

    ) ch
      ON ch.proposal_id = p.id

    WHERE p.id = ?

    LIMIT 1
    `,
    [proposalId]
  );

    if (
      !proposal ||
      !proposal.grand_total
    ) {

      return Response.json(
        {
          error:
            "Invoice total not found"
        },
        {
          status: 400
        }
      );
    }

    const amount =
      Number(proposal.grand_total);

    /* ================= CREATE ORDER ================= */

    const order =
      await razorpay.orders.create({

        amount:
          amount * 100,

        currency:
          "INR",

        receipt:
          `proposal_${proposalId}`,
      });

    return Response.json({

      id:
        order.id,

      amount:
        order.amount,

      currency:
        order.currency,

      key:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    });

  } catch (err) {

    console.error(
      "RAZORPAY ORDER ERROR:",
      err
    );

    return Response.json(
      {
        error:
          err.message
      },
      {
        status: 500
      }
    );
  }
}