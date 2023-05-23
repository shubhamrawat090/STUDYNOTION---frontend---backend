const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    // 1. Create a transporter WITH REQUIRED INFORMATION
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // 2. Send mail using that transporter WITH REQUIRED INFORMATION
    let info = await transporter.sendMail({
      from: "StudyNotion",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });

    console.log(info);
    return info;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

module.exports = mailSender;
