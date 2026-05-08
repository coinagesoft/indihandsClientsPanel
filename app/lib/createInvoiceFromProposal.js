// lib/createInvoiceFromProposal.js

export async function createInvoiceFromProposal({
  connection,
  proposalId,
  customerData
}) {

  /* ================= FETCH PROPOSAL ================= */
  const [[proposal]] = await connection.query(`
    SELECT
      p.*,
      r.rfq_type,
      r.client_name,
      r.client_email,
      r.client_phone,
      r.billing_type,
      cb.gstin,
      cb.sez_type,
      cb.id AS branch_id
    FROM proposals p
    JOIN rfqs r ON r.id = p.rfq_id
    LEFT JOIN company_branches cb ON cb.id = r.branch_id
    WHERE p.id = ?
    LIMIT 1
  `, [proposalId]);

  if (!proposal) throw new Error("Proposal not found");

  /* ================= FETCH ITEMS ================= */
  const [items] = await connection.query(`
    SELECT
      pi.*,
      pr.product_name,
      pr.hsn
    FROM proposal_items pi
    JOIN products pr ON pr.id = pi.product_id
    WHERE pi.proposal_id = ?
  `, [proposalId]);

  /* ================= FETCH CHARGES ================= */
  const [charges] = await connection.query(`
    SELECT * FROM proposal_charges WHERE proposal_id = ?
  `, [proposalId]);

  /* ================= GST LOGIC ================= */
  const isSEZ = proposal.sez_type?.toLowerCase() === "sez";

  let subtotal  = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  /* ================= ITEMS TOTAL ================= */
  for (const item of items) {
    const qty    = Number(item.quantity || 0);
    const rate   = Number(item.rate     || 0);
    const amount = qty * rate;
    subtotal += amount;

    if (isSEZ) {
      igstTotal += amount * Number(item.igst_rate || 0) / 100;
    } else {
      cgstTotal += amount * Number(item.cgst_rate || 0) / 100;
      sgstTotal += amount * Number(item.sgst_rate || 0) / 100;
    }
  }

  /* ================= CHARGES TOTAL ================= */
  for (const charge of charges) {
    const amount = Number(charge.amount      || 0);
    const tax    = Number(charge.tax_percent || 0);
    subtotal += amount;

    if (isSEZ) {
      igstTotal += amount * tax / 100;
    } else {
      cgstTotal += amount * (tax / 2) / 100;
      sgstTotal += amount * (tax / 2) / 100;
    }
  }

  const grandTotal = subtotal + cgstTotal + sgstTotal + igstTotal;

/* ================= INVOICE NUMBER ================= */

const invoiceType =
  proposal.rfq_type === "B2C"
    ? "B2C"
    : "B2B";

const prefix =
  invoiceType === "B2C"
    ? "INV-CUS"
    : "INV";

/* DATE PART */
const now = new Date();

const year = now.getFullYear();

const month = String(
  now.getMonth() + 1
).padStart(2, "0");

const day = String(
  now.getDate()
).padStart(2, "0");

const datePart =
  `${year}${month}${day}`;

/* LAST SERIAL */
const [[lastInvoice]] =
  await connection.query(`
    SELECT invoice_number
    FROM invoices
    WHERE invoice_for = ?
    ORDER BY id DESC
    LIMIT 1
  `, [invoiceType]);

let nextNumber = 1;

if (lastInvoice?.invoice_number) {

  const match =
    lastInvoice.invoice_number
      .match(/(\d+)$/);

  if (match) {
    nextNumber =
      Number(match[1]) + 1;
  }
}

/* FINAL NUMBER */
const invoiceNumber =
  `${prefix}-${datePart}-${String(nextNumber).padStart(3, "0")}`;

  /* ================= INSERT INVOICE ================= */
  const [invoiceResult] = await connection.query(`
    INSERT INTO invoices (
      invoice_number,
      invoice_date,
      proposal_id,
      rfq_id,
      buyer_company_id,
      buyer_branch_id,
      customer_id,
      buyer_name,
      buyer_gstin,
      billing_address,
      shipping_address,
      subtotal,
      cgst_total,
      sgst_total,
      igst_total,
      grand_total,
      status,
      invoice_for
    ) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    invoiceNumber,
    proposal.id,
    proposal.rfq_id,
    proposal.company_id,
    proposal.branch_id,
    proposal.customer_id,
    customerData.companyName || customerData.fullName || "",
    customerData.gstin       || null,
    customerData.billingAddress,
    customerData.billingAddress,
    subtotal,
    cgstTotal,
    sgstTotal,
    igstTotal,
    grandTotal,
    "Issued",
  proposal.rfq_type || "B2C",
  ]);

  const invoiceId = invoiceResult.insertId;

  /* ================= INSERT ITEMS ================= */
  for (const item of items) {
    await connection.query(`
      INSERT INTO invoice_items (
        invoice_id, product_id, quantity,
        rate, cgst_rate, sgst_rate, igst_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      invoiceId,
      item.product_id,
      item.quantity,
      item.rate,
      item.cgst_rate,
      item.sgst_rate,
      item.igst_rate,
    ]);
  }

 

  /* ================= RETURN ================= */
  return { invoiceId, invoiceNumber, grandTotal };
}