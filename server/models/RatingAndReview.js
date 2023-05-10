const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    requried: true,
  },
  review: {
    type: String,
    requried: true,
    trim: true,
  },
});

module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
