const mongoose = require("mongoose");
const Therapist = require("./TherapistModel");
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cant be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    therapist: {
      type: mongoose.Schema.ObjectId,
      ref: "Therapist",
      required: [true, "review must belongs to a therapist "],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "review must belongs to  a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: {
      virtuals: true,
    },
  }
);
reviewSchema.index({ therapist: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
  // this.populate({ path: "therapist", select: "fname lname" }).populate({
  //   path: "user",
  //   select: "name",
  // }); //name photo

  this.populate({
    path: "user",
    select: "name",
  }); //name photo
  next();
});
reviewSchema.statics.calcAverageRatings = async function (therapistId) {
  console.log("THer", therapistId);
  const stats = await this.aggregate([
    {
      $match: { therapist: therapistId },
    },
    {
      $group: {
        _id: "$therapist",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Therapist.findByIdAndUpdate(therapistId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQunatity: stats[0].nRating,
    });
  } else {
    await Therapist.findByIdAndUpdate(therapistId, {
      ratingsAverage: 0,
      ratingsQunatity: 0,
    });
  }
};
reviewSchema.post("save", function () {
  console.log("post");
  //this point to current review
  this.constructor.calcAverageRatings(this.therapist);
  // next();
});

//find By id and update
//find by id and delete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  console.log("pre");

  this.r = await this.findOne();
  console.log("this .r", this.r);
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcAverageRatings(this.r.therapist);
  }
});
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
