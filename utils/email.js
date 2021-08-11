require("dotenv").config();

const nodemailer = require("nodemailer");

const email = (option) => {
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const options = {
    from: process.env.EMAIL_USER,
    to: option.to,
    subject: option.subject,
    text: option.message,
    // text:htmlToText.fromString(html);
  };
  transporter.sendMail(options, function (error, info) {
    if (error) {
      console.log("mial error", error.toString());
      return;
    } else {
      console.log("info", info.response);
    }
  });
};
module.exports = email;
