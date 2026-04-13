require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');

console.log('Testing email with:', {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: parseInt(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Verification Failed:', error.message);
    process.exit(1);
  } else {
    console.log('✅ SMTP Server is ready');
    
    const mailOptions = {
      from: `"SkillSync Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'SkillSync SMTP Test',
      text: 'If you receive this, your SMTP configuration is correct!'
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ Send Failed:', err.message);
      } else {
        console.log('✅ Send Success:', info.messageId);
      }
      process.exit(0);
    });
  }
});
