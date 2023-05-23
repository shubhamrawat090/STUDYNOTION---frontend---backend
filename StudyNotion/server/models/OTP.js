const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

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
    expires: 5 * 60, // The document will be automatically deleted after 5 minutes of its creation time
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
      emailTemplate(otp)
    );

    console.log("Email send successfully: ", mailResponse.response);
  } catch (error) {
    console.error("Error occurred while send mail: ", error);
    throw error;
  }
}

// Calling the pre middleware
OPTSchema.pre("save", async function (next) {
  console.log("New document saved to database");

  // Only send an email when a new document is created
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

module.exports = mongoose.model("OTP", OPTSchema);
