import crypto from "crypto";
import db from "../../../../db";
import 
  {createInvoiceFromProposal}
 from "../../../../lib/createInvoiceFromProposal";
export async function POST(req) {

  const connection =
    await db.getConnection();

  try {

    const body =
      await req.json();

    const {

      proposalId,

      razorpay,

      customerData

    } = body;

    const {

      razorpay_order_id,

      razorpay_payment_id,

      razorpay_signature

    } = razorpay;

    /* ================= VERIFY SIGNATURE ================= */

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env
            .RAZORPAY_KEY_SECRET
        )
        .update(
          razorpay_order_id
          + "|"
          + razorpay_payment_id
        )
        .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {

      return Response.json(
        {
          success: false,
          error:
            "Invalid payment signature"
        },
        {
          status: 400
        }
      );
    }

    await connection.beginTransaction();

    /* ================= FETCH PROPOSAL ================= */

    const [[proposal]] =
      await connection.query(
        `
        SELECT

          p.id,

          p.rfq_id,

          p.company_id,

          p.customer_id,

          p.proposal_type,

          r.client_name,

          r.client_email,

          r.client_phone

        FROM proposals p

        JOIN rfqs r
          ON r.id = p.rfq_id

        WHERE p.id = ?

        LIMIT 1
        `,
        [proposalId]
      );

    if (!proposal) {

      throw new Error(
        "Proposal not found"
      );
    }

    /* ================= FETCH TOTAL ================= */

    const [[totals]] =
      await connection.query(
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
        `,
        [proposalId]
      );

    /* ================= SAVE PAYMENT ================= */

    await connection.query(
      `
      INSERT INTO proposal_payments (

        proposal_id,

        rfq_id,

        customer_id,

        razorpay_order_id,

        razorpay_payment_id,

        razorpay_signature,

        amount,

        payment_status,

        payer_name,

        payer_email,

        payer_phone,

        billing_address

      )

      VALUES (

        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?

      )
      `,
      [

        proposal.id,

        proposal.rfq_id,

        proposal.customer_id,

        razorpay_order_id,

        razorpay_payment_id,

        razorpay_signature,

        totals.grand_total,

        "Paid",

        customerData.fullName,

        customerData.email,

        customerData.phone,

        customerData.billingAddress
      ]
    );

    /* ================= UPDATE PROPOSAL ================= */

 

    /* ================= CREATE INVOICE ================= */

    /*
      CALL YOUR EXISTING
      INVOICE CREATION LOGIC HERE
    */

    /*
      Example:

      */
    const invoice =
  await createInvoiceFromProposal({

    connection,

    proposalId,

    customerData
  });

/* ================= UPDATE PROPOSAL ================= */

await connection.query(
  `
  UPDATE proposals

  SET

    payment_status = 'Paid',

    invoice_id = ?

  WHERE id = ?
  `,
  [
    invoice.invoiceId,
    proposalId
  ]
);

    await connection.commit();

 return Response.json({

  success: true,

  invoiceId:
    invoice.invoiceId
});

  } catch (err) {

    await connection.rollback();

    console.error(
      "VERIFY PAYMENT ERROR:",
      err
    );

    return Response.json(
      {
        success: false,
        error: err.message
      },
      {
        status: 500
      }
    );

  } finally {

    connection.release();
  }
}