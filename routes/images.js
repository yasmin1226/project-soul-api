const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const { userAuth, adminAuth } = require("../middlewares/auth");
const { therapistAuth } = require("../middlewares/therapistAuthMiddleware");

const User = require("../models/User");
const Therapist = require("../models/TherapistModel");
const Article = require("../models/Article");
const Post = require("../models/Post");
const { cloudinary } = require("../utils/cloudinary");

//@ route          POST   api/images/
//@descrption      upload image for the therapist
//@access          private

router.post("/therapist", therapistAuth, async (req, res) => {
  const fileStr = req.body.data;
  const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
    upload_preset: "soul",
  });

  let url = "";
  if (!req.body.data) {
    url = "";
  } else {
    url = uploadedResponse.secure_url;
  }

  try {
    const therapist = await Therapist.findOneAndUpdate(
      { _id: req.therapistId },
      { therapistImg: url },
      { new: true }
    );

    res.status(200).json(therapist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@ route          POST   api/images/
//@descrption      upload image for the article
//@access          private

router.post("/article/:article_id", therapistAuth, async (req, res) => {
  const fileStr = req.body.data;
  const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
    upload_preset: "soul",
  });

  let url = "";
  if (!req.body.data) {
    url = "";
  } else {
    url = uploadedResponse.secure_url;
  }

  try {
    const article = await Article.findOneAndUpdate(
      { _id: req.params.article_id },
      { ArticleImg: url },
      { new: true }
    );

    res.status(200).json(article);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
//@ route          POST   api/images/
//@descrption      upload image for the post
//@access          private

router.post("/posts/:post_id", userAuth, async (req, res) => {
  const fileStr = req.body.data;
  const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
    upload_preset: "soul",
  });

  let url = "";
  if (!req.body.data) {
    url = "";
  } else {
    url = uploadedResponse.secure_url;
  }

  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.post_id },
      { postImage: url },
      { new: true }
    );

    res.status(200).json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
}); 
module.exports = router;
