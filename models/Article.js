const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  therapist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'therapist',
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  ArticleImg: {
    type: String,
    default: '',
  },
  therapistImg: {
    type: String,
    default: '',
  },

  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Article = mongoose.model('Article', ArticleSchema);
module.exports = Article;
