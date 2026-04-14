const nodemailer = require("nodemailer");

async function sendOrderNotification({ to, subject, text }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;
  if (!user || !pass) {
    console.log(`[DEV] Would send to ${to}: ${subject}\n${text}`);
    return true;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  const mailOptions = {
    from: `RentalPay <${user}>`,
    to,
    subject,
    text,
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.error("[Gmail SMTP] Notification failed:", e);
    return false;
  }
}

module.exports = { sendOrderNotification };
