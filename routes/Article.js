const express = require("express");
const router = express.Router();
// const { body, validationResult } = require("express-validator");
const Article = require("../models/Article");

const { userAuth, adminAuth } = require("../middlewares/auth");
const { therapistAuth } = require("../middlewares/therapistAuthMiddleware");

const User = require("../models/User");
const Therapist = require("../models/TherapistModel");

const { cloudinary } = require("../utils/cloudinary");

//@ route          GET   api/article
//@descrption      get all articles
//@access          Public
router.get("/", async (req, res) => {
  try {
    // sort to get latest articles
    const articles = await Article.find().sort({ date: "desc" });
    res.json(articles);
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ msg: "Server error" });
  }
});

//@ route          GET  api/article
//@descrption      get one article
//@access          Public
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    res.json(article);
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ msg: "Server error" });
  }
});

//@ route          POST   api/article
//@descrption      post new article
//@access          private(just for therapist)

// router.post("/", therapistAuth, async (req, res) => {
//   const content = req.body.content;
//   const title = req.body.title;
//   const fileStr = req.body.data;

//   const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
//     upload_preset: "soul",
//   });

//   let url = "";
//   if (!req.body.data) {
//     url = "";
//   } else {
//     url = uploadedResponse.secure_url;
//   }

//   try {
//     console.log("articles");
//     const id = req.therapistId;
//     const therapist = await Therapist.findById(id).select("-password");

//     const article = await Article.create({
//       therapist: id,
//       name: therapist.fname,
//       therapistImg: therapist.therapist_image_url,
//       ArticleImg: url,
//       content,
//       title,
//     });
//     res.json(article);
//   } catch (error) {
//     console.log(error.message);
//     return res.status(404).json({ msg: "Server error" });
//   }
// });

// //@ route          DELETE  api/article
// //@descrption      delete article
// //@access          Public (it will not appear to therapist unless he is the owner in server side (may be protect it later))
// router.delete("/:id", async (req, res) => {
//   try {
//     // delete Article
//     await Article.findOneAndRemove({ _id: req.params.id });

//     res.json({ msg: "article deleted" });
//   } catch (error) {
//     console.log(error.message);
//     return res.status(404).json({ msg: "Server error" });
//   }
// });

//@ route          GET  api/article
//@descrption      get one article
//@access          Public
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    res.json(article);
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ msg: "Server error" });
  }
});

//@ route          POST   api/article
//@descrption      post new article
//@access          private(just for therapist)

router.post("/", therapistAuth, async (req, res) => {
  const content = req.body.content;
  const title = req.body.title;

  try {
    console.log("articles");
    const id = req.therapistId;
    const therapist = await Therapist.findById(id).select("-password");
    console.log(therapist);

    let url = "";
    if (!req.body.data) {
      url = "";
    } else {
      //cloudinary image upload
      const fileStr = req.body.data;
      const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
        upload_preset: "soul",
      });

      url = uploadedResponse.secure_url;
    }

    const article = await Article.create({
      therapist: id,
      name: therapist.fname,
      therapistImg: therapist.therapistImg,
      ArticleImg: url,
      content,
      title,
    });
    res.json(article);
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ msg: "Server error" });
  }
});

//@ route          DELETE  api/article
//@descrption      delete article
//@access          private(admins)

router.delete("/admin/:id", adminAuth, async (req, res) => {
  try {
    // delete Article
    await Article.findOneAndRemove({ _id: req.params.id });

    res.json({ msg: "article deleted" });
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ msg: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    // delete Article
    await Article.findOneAndRemove({ _id: req.params.id });

    res.json({ msg: "article deleted" });
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ msg: "Server error" });
  }
});
module.exports = router;
