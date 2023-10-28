// const Joi = require("joi");
const mongoose = require("mongoose");
const joiValidate = require("joi");
// const { Types } = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String,
  cart: [{ type: mongoose.Schema.ObjectId, ref: "Product" }],
  wishlist: [{ type: mongoose.Schema.ObjectId, ref: "Product" }],
  orders: [],
});



const userRegisterValidation = joiValidate.object({
  name: joiValidate.string().required(),
  email: joiValidate.string().email().required(),
  username: joiValidate.string().alphanum().min(3).max(30).required(),
  password: joiValidate.string().min(2).required(),
});

const userLoginValidation = joiValidate.object({
  email: joiValidate.string().email().required(),
  password: joiValidate.string().min(2).required(),
});

const User = mongoose.model("User", userSchema);
module.exports = { User,userRegisterValidation, userLoginValidation };
