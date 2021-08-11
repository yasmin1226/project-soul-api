const { Router } = require("express");
const router = Router();
const therapistAuthController = require("../controller/therapistAuthController");
const therapistProfileController = require("../controller/therapistProfileController");
const { therapistAuth } = require("./../middlewares/therapistAuthMiddleware");
// const reviewController = require("../controller/reviewController");
const { userAuth } = require("../middlewares/auth");
const reviewRouter = require("../routes/reviews");
const Therapist = require("../models/TherapistModel");
const { cloudinary } = require("../utils/cloudinary");

// api/therapist/uploadTherapistImage
router.patch("/uploadTherapistImage", therapistAuth, async (req, res) => {
  try {
    let url = "";
    if (!req.body.data) {
      url = "";
    } else {
      const fileStr = req.body.data;
      const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
        upload_preset: "soul",
      });
      url = uploadedResponse.secure_url;
    }
    console.log("articles");
    const id = req.therapistId;
    // const therapist = await Therapist.findByIdAndUpdate(
    //   (id,
    //   { therapistImg: url },
    //   {
    //     new: true,
    //     runValidators: true,
    //   })
    // );
    const therapist = await Therapist.findOneAndUpdate(
      { _id: id },
      { $set: { therapistImg: url } },
      { returnNewDocument: true }
    );
    console.log(therapist);
    res.json(therapist);
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ msg: "Server error" });
  }
});

//POST /tour/23242dd3/reviews
//Get/tour/23242dd3/reviews
//GET /tour/23242dd3/reviews/232d4

//router.post("/:therapistId/reviews", userAuth, reviewController.createReview);

//router.get("/:therapistId/reviews");
router.use("/:therapistId/reviews", reviewRouter);
router.get("/me", therapistAuth, therapistAuthController.loadTherapist);
router.post("/signup", therapistAuthController.signup_post);
router.post("/login", therapistAuthController.login_post);

router.get("/logout", therapistAuthController.logout_get);

router.post("/forgotpassword", therapistAuthController.forgotPassword);
router.put("/resetpassword/:token", therapistAuthController.resetPassword);
router.patch(
  "/updatemypassword",
  therapistAuth,
  therapistAuthController.updatePassword
);
router.get(
  "/top-5-rated",
  therapistAuthController.aliasTopRatedTherapist,
  therapistAuthController.getAllTherapists
);

router.get("/", therapistAuthController.getAllTherapists);
router.get("/:id", therapistAuthController.getOneTherapist);
router.patch("/updatatherapist/:id", therapistAuthController.updataTherapist);
router.delete("/deletetherapist/:id", therapistAuthController.deleteTherapist);
router.get(
  "/confirm-therapist-email/:token",
  therapistAuthController.confirmTherapistEmail
);

module.exports = router;
