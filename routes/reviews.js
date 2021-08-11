const { Router } = require("express");
const reviewController = require("../controller/reviewController");
//const { therapistAuth } = require("./../middlewares/therapistAuthMiddleware");
const { userAuth } = require("./../middlewares/auth");
const router = Router({ mergeParams: true });
//POST /therapist/23242dd3/reviews
//post/reviews
router.post("/", userAuth, reviewController.createReview);
router.get("/", reviewController.getAllReviews);

router.patch("/:id", userAuth, reviewController.updateReview);
router.delete("/:id", userAuth, reviewController.deleteReview);

module.exports = router;
