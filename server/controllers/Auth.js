const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// sendOTP - HW: Write validations like checking email.
exports.sendOTP = async (req, res) => {
  try {
    // fetch email from request body
    const { email } = req.body;

    //check if user already exists
    const checkUserPresent = await User.findOne({ email });

    //return if user is already present
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    //generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated: ", otp);

    //check unique otp or not
    var result = await OTP.findOne({ otp: otp });

    // keep generating otp till you get a unique otp
    ///// A BAD PRACTICE - We keep checking otp again and again inside DB.
    // In an organisation we use a service which is guaranteed to send a unique otp each time.
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });

      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    //create an entry for OTP - email will be sent before creating because of PRE middleware we have written in OTP model
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    //return response successful
    return res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp,
    });
  } catch (error) {
    console.error("Error encountered.", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// signUp
exports.signup = async (req, res) => {
  try {
    // data fetch from request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // validate data
    if (!firstName || !lastName || !password || !confirmPassword || !otp) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // match 2 passwords - pass, confirmPass
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password value does not match, please try again.",
      });
    }

    // check user already exist or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    // find most recent OTP for the user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1); // sort basis on createdAt(descending order) and get first order
    console.log(recentOtp);

    // validate the OTP
    if (recentOtp.length === 0) {
      // OTP not found
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp.otp) {
      //Invalid otp
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // entry create in DB

    // create in Profile db for additionalDetails
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      // api to generate image with full name initials like SR for Shubham Rawat
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    // return response
    return res.status(200).json({
      success: true,
      message: "User is registered successfully",
      user,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

// login
exports.login = async (req, res) => {
  try {
    // get data from request body
    const { email, password } = req.body;

    // validate data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required, please try again",
      });
    }

    // user check exists or not
    const user = await User.findOne({ email }).populate("additionalDetails"); //populate is not needed
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, please signup first.",
      });
    }

    // generate JWT, after password matching
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      // create cookie and send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 100),
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in successfully",
      });
    } else {
      res.status(401).json({
        success: true,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: true,
      message: "Login failure, please try again",
    });
  }
};

// changePassword
exports.changePassword = async (req, res) => {
  //get data from req body
  //get oldPassword, newPassword, confirmNewPassword
  //validation
  //update password in database
  //send mail - password updated(using mailSender in utils)
  //return response
};
