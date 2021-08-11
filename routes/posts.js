const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { adminAuth, userAuth } = require("../middlewares/auth");
const { cloudinary } = require("../utils/cloudinary");
// Post model
const Post = require("../models/Post");

//User model
const User = require("../models/User");

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    console.log(posts);
    // if (posts.isAccepted) {
    //   return res.status(404).json({ msg: 'Post is pending' });
    // }
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@ route          Get api/posts/:id
//@descrption      Get  post by id
//@access          Public
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    // if (!post.isAccepted) {
    //   return res.status(404).json({ msg: 'Post is pending' });
    // }
    res.json(post);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    console.error(err.message);
    return res.status(500).send("Server error");
  }
});
// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post(
  "/",
  userAuth,
  check("text", "Content is required").notEmpty(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      let url = "";
      if (!req.body.data) {
        npm;
        url = "";
      } else {
        //cloudinary image upload
        const fileStr = req.body.data;
        const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
          upload_preset: "soul",
        });

        url = uploadedResponse.secure_url;
      }
      const newPost = new Post({
        text: req.body.text,
        // category: req.body.category,
        postImage: url,
        name: user.name,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   POST  api/posts
// @desc    Post Blog with pagination
// @access  Public

router.post("/", async (req, res, next) => {
  const { pageNumber, pageSize } = req.body;
  const blogs = await Post.find()
    .populate("author")
    .sort({ date: -1 })
    .skip(pageNumber * pageSize)
    .limit(pageSize);
  res.send(blogs);
});

// @route   GET  api/posts
// @desc    Get count bLogs
// @access  Public

router.get("/count", async (req, res, next) => {
  const count = await Post.count();
  res.send({ count: count });
});

router.get("/blogs", async (req, res) => {
  const page = req.query.page * 1;
  const limit = req.query.limit * 1;
  const skip = (page - 1) * limit;
  const blogs = await Post.find({})
    .populate({
      path: "author",
      select: "username",
    })
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  if (req.query.page) {
    const totalBlogs = await Post.estimatedDocumentCount();
    if (skip >= totalBlogs) {
      // throw new Error();

      res.status(404).json({ message: "You Checked All Posts" });
      return;
    }
  }

  res.send(blogs);
});
// @route   UPDATE api/posts/:id
// @desc    Update post
// @access  Private

router.patch("/:id", adminAuth, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (post) {
      res.status(200).json({
        status: "sucscess",

        post: post,
      });
    } else {
      throw Error("that post not exist");
    }
  } catch (err) {
    // const errors = handleErrors(err);
    console.log(err);
    res.status(400).json({ msg: "err" });
  }
});
// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete("/:id", userAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put("/like/:id", userAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put("/unlike/:id", userAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has not yet been liked
    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    // remove the like
    post.likes = post.likes.filter(
      ({ user }) => user.toString() !== req.user.id
    );

    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  "/comment/:id",
  userAuth,
  check("text", "Text is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete("/comment/:id/:comment_id", userAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await post.save();

    return res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

//@ route          Patch  api/posts
//@descrption      edit Posts
//@access          private(admins)

router.patch("/admin/:id", adminAuth, async (req, res) => {
  try {
    await Post.findOneAndUpdate({
      _id: req.params.id,
      isAccepted: req.body.isAccepted,
    });

    res.json({ msg: "post updated" });
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ msg: "Server error" });
  }
});
//@ route          DELETE  api/posts
//@descrption      delete posts
//@access          private(admins)

router.delete("/admin/:id", adminAuth, async (req, res) => {
  try {
    await Post.findOneAndRemove({ _id: req.params.id });

    res.json({ msg: "Post deleted" });
  } catch (error) {
    console.log(error.message);
    return res.status(404).json({ msg: "Server error" });
  }
});

module.exports = router;
