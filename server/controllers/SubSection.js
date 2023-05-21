const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { findById, findByIdAndUpdate } = require("../models/User");

//create Subsection
exports.createSubSection = async (req, res) => {
  try {
    //fetch data from req body
    const { sectionId, title, description } = req.body;

    //extract file(video)
    const video = req.files.video;

    //validation
    if (!sectionId || !title || !description || !video) {
      return res.status(404).json({
        success: false,
        message: "All fields are required",
      });
    }

    console.log(video);

    //upload video to cloudinary and get secure url
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    //create subsection
    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: `${uploadDetails.duration}`,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    //push subsection ID in Section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: { subSection: subSectionDetails._id },
      },
      { new: true }
    ).populate("subsection"); // HW: log updated section here after adding populate query

    console.log(updatedSection);

    //return response
    return res.status(200).json({
      success: true,
      message: "Sub Section Created Successfully",
      data: updatedSection,
    });
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error creating new sub-section:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// HW: updateSubSection
exports.updateSubSection = async (req, res) => {
  try {
    // Fetch data
    const { sectionId, title, description } = req.body;

    // Check if the subsection exists
    const subSection = await SubSection.findById(sectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    // update the details which are provided in the subsection object fetched
    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }

    // if there is a video file sent then upload it via uploadImageToCloudinary() from imageUploaded.js util
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );

      // update the video details in the subsection object
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    // save to DB
    await subSection.save();

    // Send success repsonse
    return res.json({
      success: true,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    });
  }
};

// HW: deleteSubSection
exports.deleteSubSection = async (req, res) => {
  try {
    // Fetch subsectionId, sectionId from the request body
    const { subSectionId, sectionId } = req.body;

    // DOUBT: Is this needed?
    // Delete the Sub-Section entry from the Section
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );

    // Delete from Sub-Section DB
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    // Check if a valid subsection deletion is done
    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }

    // send response
    return res.json({
      success: true,
      message: "SubSection deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    });
  }
};
