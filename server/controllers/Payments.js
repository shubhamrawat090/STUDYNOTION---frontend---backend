const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const mongoose = require("mongoose");

//capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  //get courseId and userId
  const { course_id } = req.body;
  const userId = req.user.id;

  //validation
  //valid courseID
  if (!course_id) {
    return res.json({
      success: false,
      message: "Please provide valid course ID",
    });
  }

  //valid courseDetail
  let course;
  try {
    course = await Course.findById(course_id);

    if (!course) {
      return res.json({
        success: false,
        message: "Could not find the course",
      });
    }

    //user already pay for the same course
    const uid = new mongoose.Types.ObjectId(userId); // convert userId from string -> mongodb object ID
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(200).json({
        success: false,
        message: "Student is already enrolled",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  //order create
  const amount = course.price;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: Math.random(Date.now()).toString(),
    notes: {
      courseId: course_id,
      userId,
    },
  };

  try {
    //initiate the payment using razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);

    //return response
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: "Could not initiate order",
    });
  }
};

//verify signature of Razorpay and Server
exports.verifySignature = async (req, res) => {
  const webhookSecret = "123456";

  const signature = req.headers["x-razorpay-signature"];

  // signature is hashed - using some steps
  // it cannot be decrypted
  // but we can apply those same steps on our webhookSecret to convert to hashed form
  // we compare this to signature

  // HMAC is combination of - HASH ALGO, SECRET_KEY . It is like SHA but with a SECRET_KEY
  // NOTE: These are steps we need to follow to perform HASHING
  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  // signature matches with hashed webhook secret
  if (signature === digest) {
    console.log("Payment is Authorised");

    // ACTION: we enroll student to course
    // we don't have userId, courseId from req.body as this api is HIT FROM RAZORPAY and not our frontend
    // we use courseId, userId inside the "notes" while creating Razorpay order

    const { courseId, userId } = req.body.payload.payment.entity.notes;

    try {
      // fulfill the action

      // find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course not found",
        });
      }

      console.log(enrolledCourse);

      // find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
      );

      console.log(enrolledStudent);

      // main send confirming the course enrollment
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations, from StudyNotion",
        "Congratulations, you are onboarded into the course"
      );

      console.log(emailResponse);

      return res.status(200).json({
        success: true,
        message: "Signature Verified and Course Added",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
  // signature did not match
  else {
    return res.status(400).json({
      success: false,
      message: "Invalid Request",
    });
  }
};
