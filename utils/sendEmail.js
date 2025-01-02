const nodemailer = require("nodemailer");
require('dotenv').config({ path: '../.env' }); // Adjust the path 

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10), // Convert port to an integer
        secure: process.env.EMAIL_SECURE === "true", // Convert string to boolean
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });


const sendEmail = async (to, subject, text,verificationCode) => {
  const mailOptions = {
    from: `"Wanderlust" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    text,
    html :verificationCode,
  };

  try {
    
   const response = await transporter.sendMail(mailOptions);
 

  } catch (error) {
    console.error("Error sending email:", error);
  }

};

module.exports = sendEmail;
