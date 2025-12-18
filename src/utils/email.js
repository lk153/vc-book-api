import nodemailer from "nodemailer";
import config from '../config/config.js';

async function sendEmail(email, subject, text) {
  const transporter = nodemailer.createTransport({
    host: config.email.smtpHost,
    port: config.email.smtpPort,
    secure: false,
    auth: {
      user: config.email.smtpUser,
      pass: config.email.smtpPass,
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