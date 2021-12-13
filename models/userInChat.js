const mongoose = require("mongoose");
const Joi = require("joi");

const UserInChatSchema = new mongoose.Schema({
  currentChatId: {
    type: String,
  },
  userId: {
    type: String,
  },
  online: {
    type: Boolean,
    default: false,
  },
});

const UserInChat = mongoose.model("UserInChat", UserInChatSchema);

module.exports = {
  UserInChat,
};
