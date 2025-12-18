import nodemailer from "nodemailer";
import config from '../config/config.js';

async function sendEmail(email, subject, text) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: '"BookStore" <vietnguyen148@gmail.com>',   
    to: email,
    subject: subject,
    text: text,
  });

  console.log("Message sent:", info.messageId);
}


export default sendEmail;