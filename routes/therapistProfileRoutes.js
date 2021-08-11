const { Router } = require("express");
const router = Router();
//const therapistAuthController = require("../controller/therapistAuthController");
const therapistProfileController = require("../controller/therapistProfileController");
const { therapistAuth } = require("../middlewares/therapistAuthMiddleware");
const Therapist = require("../models/TherapistModel");

router.put(
  "/updateExperience/:id",
  therapistProfileController.updateExperience
);
router.delete(
  "/deleteExperience/:exp_id",
  therapistAuth,

  therapistProfileController.deleteExperience
);
router.put(
  "/updateEducation/:id",

  therapistProfileController.updateEducation
);
router.delete(
  "/deleteEducation/:edu_id",
  therapistAuth,

  therapistProfileController.deleteEducation
);
router.post(
  "/addSocialMedia",
  therapistAuth,

  therapistProfileController.socialMediaData
);
router.patch(
  "/updatatherapist/:id",
  therapistProfileController.updataTherapist
);

router.get(
  "/myprofile",
  therapistAuth,
  therapistProfileController.getmyprofile
);

module.exports = router;
