const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.updateProfile = async (req, res) => {
  try {
    // Get data
    const { dateOfBirth = "", about = "", contactNumber } = req.body;

    // Get userId
    const id = req.user.id;

    // Find profile
    const userDetails = await User.findById(id); // find the userDetail

    // Get profile ID from user (additionalDetails)
    const profileId = userDetails.additionalDetails;

    // Get profile from profileId
    const profileDetails = await Profile.findById(profileId);

    // Update profile
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;

    // Save the updated profile
    await profileDetails.save();

    //return response
    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      profileDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile, please try again later",
      error: error.message,
    });
  }
};
