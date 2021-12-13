const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 8,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 8,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  is_login: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: "",
  },
  coverImage: {
    type: String,
    default: "",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  city: {
    type: String,
    default: "",
    required: false,
  },
  street: {
    type: String,
    default: "",
    required: false,
  },
  birthday: {
    type: String,
    default: "",
    required: false,
  },
  phone: {
    type: String,
    default: "",
    required: false,
  },
  headline: {
    type: String,
    required: false,
    minlength: 2,
    maxlength: 24,
    default: "head Line",
  },
  savePosts: {
    type: mongoose.Schema.Types.Array,
    ref: "Post",
    default: [],
  },
});

const User = mongoose.model("User", userSchema);

// validate inputs to register

function validateRegister(user) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(8).required(),
    lastName: Joi.string().trim().min(2).max(8).required(),
    email: Joi.string().min(6).max(255).required(),
    password: Joi.string().min(6).max(255).required(),
  });

  return schema.validate(user);
}

// validate inputs to login

function validateLogin(user) {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required(),
    password: Joi.string().min(6).max(255).required(),
  });

  return schema.validate(user);
}

// validate edit detailers //
function validEditDetails(body) {
  const schema = Joi.object({
    city: Joi.string().min(2).max(255),
    street: Joi.string().min(2).max(255),
    birthday: Joi.string().min(10).max(24),
    name: Joi.string().min(2).max(8),
    lastName: Joi.string().min(2).max(8),
    headline: Joi.string().min(2).max(24),
    phone: Joi.string()
      .min(9)
      .max(10)
      .regex(/^0[2-9]\d{7,8}$/),
  });

  return schema.validate(body);
}
module.exports = {
  validateLogin,
  validateRegister,
  validEditDetails,
  User,
};
