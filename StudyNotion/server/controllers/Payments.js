const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const {
  paymentSuccessEmail,
} = require("../mail/templates/paymentSuccessEmail");
const { default: mongoose } = require("mongoose");

// Initiate the razorpay order
// When buy now is clicked -> an order is created(EVEN IF YOU DON'T COMPLETE PAYMENT)
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;

  if (!courses.length) {
    return res.json({
      success: false,
      message: "Please provide course id",
    });
  }

  let totalAmount = 0;

  for (const course_id of courses) {
    let course;
    try {
      // Check if it is a valid course
      course = await Course.findById(course_id);
      if (!course) {
        return res.status(200).json({
          success: false,
          message: "Could not find thew course",
        });
      }

      // Check user didn't buy the course already
      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return res.status(200).json({
          success: false,
          message: "Student is already enrolled",
        });
      }

      // Add to get total amount
      totalAmount += course.price;
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: Math.random(Date.now()).toString(),
    };

    try {
      const paymentResponse = await instance.orders.create(options);
      res.json({
        success: true,
        message: paymentResponse,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Could not initiate order",
      });
    }
  }
};

//verify Signature of Razorpay and Server
exports.verifySignature = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const courses = req.body?.courses;
  const userId = req.user.id;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" });
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    //Enroll Student
    await enrolledStudents(courses, userId, res);

    //return res
    return res.status(200).json({
      success: true,
      message: "Payment Verified",
    });
  }

  return res.status(200).json({
    success: false,
    message: "Payment Failed",
  });
};

const enrolledStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please provide data for Courses or UserID",
    });
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
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

      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
          },
        },
        { new: true }
      );

      // Send mail to student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      );

      console.log("Email Sent Successfully", emailResponse);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please provide all the fields",
    });
  }

  try {
    // Find Student
    const enrolledStudent = await User.findById(userId);
    await mailSender(
      enrolledStudent.email,
      `Payment Recieved`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log(error);
    return res.sttus(500).json({
      success: false,
      message: "Could Not Send Email",
    });
  }
};

//capture the payment and initiate the Razorpay order
// exports.capturePayment = async (req, res) => {
//   //get courseId and UserID
//   const { course_id } = req.body;
//   const userId = req.user.id;
//   //validation
//   //valid courseID
//   if (!course_id) {
//     return res.json({
//       success: false,
//       message: "Please provide valid course ID",
//     });
//   }
//   //valid courseDetail
//   let course;
//   try {
//     course = await Course.findById(course_id);
//     if (!course) {
//       return res.json({
//         success: false,
//         message: "Could not find the course",
//       });
//     }

//     //user already pay for the same course
//     const uid = new mongoose.Types.ObjectId(userId);
//     if (course.studentsEnrolled.includes(uid)) {
//       return res.status(200).json({
//         success: false,
//         message: "Student is already enrolled",
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }

//   //order create
//   const amount = course.price;
//   const currency = "INR";

//   const options = {
//     amount: amount * 100,
//     currency,
//     receipt: Math.random(Date.now()).toString(),
//     notes: {
//       courseId: course_id,
//       userId,
//     },
//   };

//   try {
//     //initiate the payment using razorpay
//     const paymentResponse = await instance.orders.create(options);
//     console.log(paymentResponse);
//     //return response
//     return res.status(200).json({
//       success: true,
//       courseName: course.courseName,
//       courseDescription: course.courseDescription,
//       thumbnail: course.thumbnail,
//       orderId: paymentResponse.id,
//       currency: paymentResponse.currency,
//       amount: paymentResponse.amount,
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       success: false,
//       message: "Could not initiate order",
//     });
//   }
// };

//verify Signature of Razorpay and Server

// exports.verifySignature = async (req, res) => {
//   const webhookSecret = "12345678";

//   const signature = req.headers["x-razorpay-signature"];

//   const shasum = crypto.createHmac("sha256", webhookSecret);
//   shasum.update(JSON.stringify(req.body));
//   const digest = shasum.digest("hex");

//   if (signature === digest) {
//     console.log("Payment is Authorised");

//     const { courseId, userId } = req.body.payload.payment.entity.notes;

//     try {
//       //fulfil the action

//       //find the course and enroll the student in it
//       const enrolledCourse = await Course.findOneAndUpdate(
//         { _id: courseId },
//         { $push: { studentsEnrolled: userId } },
//         { new: true }
//       );

//       if (!enrolledCourse) {
//         return res.status(500).json({
//           success: false,
//           message: "Course not Found",
//         });
//       }

//       console.log(enrolledCourse);

//       //find the student andadd the course to their list enrolled courses me
//       const enrolledStudent = await User.findOneAndUpdate(
//         { _id: userId },
//         { $push: { courses: courseId } },
//         { new: true }
//       );

//       console.log(enrolledStudent);

//       //mail send krdo confirmation wala
//       const emailResponse = await mailSender(
//         enrolledStudent.email,
//         "Congratulations from CodeHelp",
//         "Congratulations, you are onboarded into new CodeHelp Course"
//       );

//       console.log(emailResponse);
//       return res.status(200).json({
//         success: true,
//         message: "Signature Verified and COurse Added",
//       });
//     } catch (error) {
//       console.log(error);
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   } else {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid request",
//     });
//   }
// };
