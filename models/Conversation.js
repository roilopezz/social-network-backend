const mongoose = require("mongoose");
const Joi = require("joi");

const ConversationSchema = new mongoose.Schema(
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

const Conversation = mongoose.model("Conversation", ConversationSchema);

function validConversation(conversation) {
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

  return schema.validate(conversation);
}

module.exports = {
  Conversation,
  validConversation,
};
