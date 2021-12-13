const mongoose = require("mongoose");
const Joi = require("joi");

const postsSchema = mongoose.Schema({
  description: {
    type: String,
    require: true,
    minlength: 2,
    maxlength: 1024,
  },
  postImage: {
    type: String,
    require: false,
    minlength: 11,
    maxlength: 1024,
  },
  postNumber: {
    type: String,
    minlength: 1,
    maxlength: 99999999999,
    unique: true,
  },
  created_At: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Array,
    default: [],
  },
  comments: {
    type: Array,
    ref: "Comment",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    ref: "User",
  },
  lastName: {
    type: String,
    ref: "User",
  },
  userImage: {
    type: String,
    ref: "User",
  },
});

const Post = mongoose.model("Post", postsSchema);

function validPost(post) {
  const schema = Joi.object({
    description: Joi.string().required().min(2).max(1024),
    postImage: Joi.string().min(11).max(1024),
  });

  return schema.validate(post);
}

async function generatePostNumber() {
  for (let i = 1; i < 99999999999; i++) {
    const post = await Post.findOne({ postNumber: [i] });
    if (!post) {
      return String([i]);
    }
  }
}

module.exports = {
  generatePostNumber,
  validPost,
  Post,
};
