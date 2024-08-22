const nodemailer = require('nodemailer');
const { MAIL_PORT, MAIL_USER, MAIL_PASSWORD, MAIL_HOST } = require('../config');

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: false, // or 'STARTTLS'
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD
  }
});

const sendOtp = async (otp, email) => {



  const mailOptions = {
    from: 'otp@example.com',
    to: email,
    subject: 'Your One-Time Password (OTP)',
    text: `Enter the following OTP to verify your email address: ${otp}`
  };


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Email sent: ' + info.response);
  });

  return 'OTP sent successfully';
};


const sendCreditMail = async (email, payload) => {
  const mailOptions = {
    from: 'otp@example.com',
    to: email,
    subject: 'Paycore - Credit Alert',
    text: `This is to notify you that a credit alert occurred on your account with us. Please review the details below: \nAccount: ${payload.account_number} \nAmount: ${payload.amount}`
  };


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Email sent: ' + info.response);
  });

  return 'Credit alert sent successfully';
};

const reversalMail = async (email, payload) => {
  const mailOptions = {
    from: 'otp@example.com',
    to: email,
    subject: 'Paycore - Reversal Alert',
    text: `This is to notify you that a reversal occurred on your account with us. Please review the details below: \nAccount: ${payload.account_number} \nAmount: ${payload.amount}`
  };


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Email sent: ' + info.response);
  });

  return 'Reversal mail sent successfully';
};

module.exports = {
  sendOtp,
  sendCreditMail,
  reversalMail
}