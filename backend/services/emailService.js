const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
    }
  });
};

// HTML Email Template
const createBirthdayEmailTemplate = (username) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Happy Birthday!</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        h1 {
          margin: 0;
          font-size: 2.5em;
        }
        .birthday-message {
          font-size: 1.2em;
          margin: 20px 0;
        }
        .signature {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #667eea;
        }
        .confetti {
          font-size: 1.5em;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Happy Birthday, ${username}! 🎉</h1>
      </div>
      <div class="content">
        <div class="confetti">🎂 🎈 🎁 🥳</div>
        
        <p class="birthday-message">
          Dear <strong>${username}</strong>,
        </p>
        
        <p class="birthday-message">
          On this special day, we want to wish you a fantastic birthday filled with joy, laughter, and wonderful moments! 
          May your year ahead be as amazing as you are.
        </p>
        
        <p class="birthday-message">
          Thank you for being a valued part of our community. We appreciate you and hope you have an incredible celebration!
        </p>
        
        <div class="confetti">✨ 🎊 🍰 ✨</div>
        
        <div class="signature">
          <p>Warmest wishes,</p>
          <p><strong>The Birthday Reminder Team</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send birthday email
const sendBirthdayEmail = async (user) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Birthday Reminder" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: `🎂 Happy Birthday, ${user.username}!`,
      html: createBirthdayEmailTemplate(user.username),
      text: `Happy Birthday, ${user.username}!\n\nOn this special day, we want to wish you a fantastic birthday filled with joy, laughter, and wonderful moments! May your year ahead be as amazing as you are.\n\nThank you for being a valued part of our community.\n\nWarmest wishes,\nThe Birthday Reminder Team`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Birthday email sent to ${user.email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${user.email}:`, error);
    return false;
  }
};

module.exports = { sendBirthdayEmail };