const nodemailer = require("nodemailer");
const axios = require("axios");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmailAlert(url) {

  await transporter.sendMail({
    from: `"Creonox Monitor" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: "🚨 Website Down Alert",
    text: `Your monitor detected downtime.\n\nURL: ${url}`
  });

}

async function sendTelegramAlert(url) {

  const message = `🚨 Website Down\n\n${url}`;

  await axios.post(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message
    }
  );

}

async function sendAlert(url) {

  await sendEmailAlert(url);
  await sendTelegramAlert(url);

}

module.exports = { sendAlert };