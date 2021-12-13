const mongoose = require("mongoose");
const Joi = require("joi");

const commentSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: mongoose.Schema.Types.String,
    ref: "User",
  },
  lastName: {
    type: mongoose.Schema.Types.String,
    ref: "User",
  },
  userImage: {
    type: String,
    default: "",
  },
  comment: {
    type: String,
  },
  created_At: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model("comment", commentSchema);

function validComment(comment) {
  const schema = Joi.object({
    comment: Joi.string().required().min(2).max(1024),
  });

  return schema.validate(comment);
}

module.exports = {
  Comment,
  validComment,
};
