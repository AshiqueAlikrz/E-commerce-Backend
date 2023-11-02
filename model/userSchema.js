// const Joi = require("joi");
const mongoose = require("mongoose");
const joiValidate = require("joi");

// const { Types } = require('mongoose');


function generateRandomUsername(name) {
  let randomFourDigitNumber = Math.floor(1000 + Math.random() * 9000);
  return `${name}${randomFourDigitNumber}`;
}


const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: {
    type: String,
    default: function () {
      return generateRandomUsername(this.name);
    },
  },
  password: String,
  cart: [{ type: mongoose.Schema.ObjectId, ref: "Product" }],
  wishlist: [{ type: mongoose.Schema.ObjectId, ref: "Product" }],
  orders: [],
});

const userRegisterValidation = joiValidate.object({
  name: joiValidate.string().required(),
  email: joiValidate.string().email().required(),
  // username: joiValidate.string().alphanum().min(3).max(30).required(),
  // username: joiValidate.string(),
  password: joiValidate.string().min(2).required(),
});

const userLoginValidation = joiValidate.object({
  email: joiValidate.string().email().required(),
  password: joiValidate.string().min(2).required(),
});

const User = mongoose.model("User", userSchema);
module.exports = { User, userRegisterValidation, userLoginValidation };
