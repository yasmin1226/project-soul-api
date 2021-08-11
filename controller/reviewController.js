const Review = require("./../models/reviewModel");
const Therapist = require("./../models/TherapistModel");

const handleErrors = (err) => {
  let errors = {
    // fname: "",
    // lname: "",
    // email: "",
    // password: "",
    // confirmPassword: "",
  };

  if (err.message.includes("that review not exist")) {
    errors.err = "that review not exist";
  } else {
    errors.err = err.message;
  }

  return errors;
};
exports.getAllReviews = async (req, res) => {
  try {
    let filter = {};
    if (req.params.therapistId) filter = { therapist: req.params.therapistId };
    const reviews = await Review.find(filter);
    res.status(200).json(reviews);
  } catch (err) {
    console.log(err);
    res.status(400).json({ err: err.message });
  }
};
exports.createReview = async (req, res) => {
  try {
    console.log("req.user", req.user);
    //allow nested routes

    if (!req.body.therapist) req.body.therapist = req.params.therapistId;
    if (!req.body.user) req.body.user = req.user.id;
    const review = await Review.create(req.body);
    //const therapist=await  Therapist.findById(req.body.therapist)
    //onsole.log("ther",therapist)
    res.status(200).json(review);
  } catch (err) {
    console.log("err", err);
    res.status(400).json({ err: err.message });
  }
};
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review) {
      throw Error("that review not exist");
    }
    res.status(200).json(review);
  } catch (err) {
    const errors = handleErrors(err);
    console.log(err);
    res.status(400).json({ errors });
  }
};
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      throw Error("that review not exist");
    }
    res.status(200).json({ msg: "Appointment removed from schedule" });
  } catch (err) {
    const errors = handleErrors(err);
    console.log(err);
    res.status(400).json({ errors });
  }
};
