const mongoose = require("mongoose");
const Joi = require("joi");

const notificationSchema = new mongoose.Schema({
  senderName: {
    type: String,
    minlength: 2,
    maxlength: 8,
  },
  senderLastName: {
    type: String,
    minlength: 2,
    maxlength: 8,
  },
  senderId: {
    type: String,
    default: "",
  },
  receiverId: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

// valid notifications

function validateNotifications(notifications) {
  const schema = Joi.object({
    senderName: Joi.string().min(2).max(8).required(),
    senderLastName: Joi.string().min(2).max(8).required(),
    senderId: Joi.string().min(24).max(24).required(),
    receiverId: Joi.string().min(24).max(24).required(),
  });

  return schema.validate(notifications);
}

module.exports = {
  Notification,
  validateNotifications,
};
