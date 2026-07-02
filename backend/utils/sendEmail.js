const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    let transporter;

    // Check if we are running with mock or default Ethereal credentials
    if (
      !process.env.EMAIL_USER ||
      process.env.EMAIL_USER.includes('mock_user') ||
      process.env.EMAIL_USER === ''
    ) {
      // Create ethereal test account on the fly for development
      console.log('Creating Ethereal SMTP developer test account...');
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      // Override recipient in development to preview emails
      console.log(`Ethereal Email credentials: user=${testAccount.user}, pass=${testAccount.pass}`);
    } else {
      // Standard credentials from env
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    const message = {
      from: `"Medicare Portal" <noreply@medicare.com>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<div>${options.message}</div>`,
    };

    const info = await transporter.sendMail(message);
    console.log(`Message sent: ${info.messageId}`);
    
    // If Ethereal test account was used, log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Preview Email URL: ${previewUrl}`);
      return previewUrl;
    }
    
    return true;
  } catch (error) {
    console.error(`Email sending error: ${error.message}`);
    // Return true anyway so development registration is not blocked by SMTP connection failures
    return false;
  }
};

module.exports = sendEmail;
