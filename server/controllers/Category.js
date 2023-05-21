const Category = require("../models/Category");

// createCategory
exports.createCategory = async (req, res) => {
  try {
    // fetch data from the request body
    const { name, description } = req.body;

    // Check is name is empty
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Create Entry in the Category DB
    const CategoryDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(CategoryDetails);

    // Send Successful response
    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// showAllCategories
exports.showAllCategories = async (req, res) => {
  try {
    // Get all entries in the Category DB -> only name and description fields
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );

    // Send response
    return res.status(200).json({
      success: true,
      allCategories,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// categoryPageDeails
exports.categoryPageDetails = async (req, res) => {
  try {
    //get categoryId
    const { categoryId } = req.body;

    //get courses for specified categoryId
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();

    //validation
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Data Not Found",
      });
    }

    //get courses for different categories
    const differentCategories = await Category.find({
      // NOT equal to categoryId
      _id: { $ne: categoryId },
    })
      .populate("courses")
      .exec();

    //get top(10 maybe) selling courses
    // HW - write it on your own

    //return response
    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategories,
        // can pass top selling courses
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
