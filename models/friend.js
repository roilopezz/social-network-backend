const mongoose = require("mongoose");
const Joi = require("joi");

const FriendsSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
      default: [],
    },
    sender: {
      type: Object,
      default: {},
    },
    receiver: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const Friend = mongoose.model("Friend", FriendsSchema);

function validFriend(friend) {
  const schema = Joi.object({
    members: Joi.array().required(),
    sender: Joi.object({
      senderId: Joi.string().min(24).max(24).required(),
      imageSender: Joi.string().min(2).max(1024).required(),
      senderName: Joi.string().min(2).max(17).required(),
    }).required(),
    receiver: Joi.object({
      receiverId: Joi.string().min(24).max(24).required(),
      imageReceiver: Joi.string().min(2).max(1024).required(),
      receiverName: Joi.string().min(2).max(17).required(),
    }).required(),
  });

  return schema.validate(friend);
}

module.exports = {
  Friend,
  validFriend,
};
