const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OPTSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

/////// WE ALWAYS WRITE PRE MIDDLEWARE BEFORE BEFORE EXPORT AND AFTER SCHEMA

// a function -> to send emails
async function sendVerificationEmail(email, otp) {
  try {
    // this function is imported from utils folder
    const mailResponse = await mailSender(
      email,
      "Verification Email from StudyNotion",
      otp
    );

    console.log("Email send successfully: ", mailResponse);
  } catch (error) {
    console.error("Error occurred while send mail: ", error);
    throw error;
  }
}

// Calling the pre middleware
OPTSchema.pre("save", async function (next) {
  // we send current object's email and otp and call the sendVerificationEmail() function
  await sendVerificationEmail(this.email, this.otp);

  // move on to next middleware
  next();
});

module.exports = mongoose.model("OTP", OPTSchema);
