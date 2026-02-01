import nodemailer from "nodemailer";

export async function sendResetPasswordEmail(to, resetLink) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // simple way
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS, // Gmail App Password
    },
  });

  await transporter.sendMail({
    from: `"Indihands Admin" <${process.env.MAIL_USER}>`,
    to,
    subject: "Reset Your Password",
    html: `
      <h3>Password Reset Request</h3>
      <p>Click below to set your new password:</p>
      <a href="${resetLink}" target="_blank">${resetLink}</a>
      <p><b>This link will expire in 15 minutes.</b></p>
    `,
  });
}
