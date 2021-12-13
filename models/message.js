const mongoose = require("mongoose");
const Joi = require("joi");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    sender: {
      type: String,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);

function validMessage(message) {
  const schema = Joi.object({
    conversationId: Joi.string().min(24).max(24),
    sender: Joi.string().min(24).max(24),
    text: Joi.string().min(1).max(1024),
    image: Joi.string().min(2).max(1024),
    name: Joi.string().min(2).max(8),
    lastName: Joi.string().min(2).max(8),
  });

  return schema.validate(message);
}

module.exports = {
  Message,
  validMessage,
};
