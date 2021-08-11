const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  text: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  postImage: {
    type: String,
    default: "",
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
      text: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  category: {
    type: String,
    // required: true,
    enum: [
      "Anxiety disorders",
      "Mood disorders",
      "Psychotic disorders",
      "Obsessive-compulsive disorder",
      "Post-traumatic stress disorder",
      "Stress response syndromes",
      "Dissociative disorders",
      "Factitious disorders",
      "Somatic symptom disorders",
    ],
  },
  isAccepted: {
    // type: Boolean,
    // default: false,
    type: String,
    enum: ["Pending", "Accepted", "Rejected"],
    default: "Pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Post = mongoose.model("post", PostSchema);
