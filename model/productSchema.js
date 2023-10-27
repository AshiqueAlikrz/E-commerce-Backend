const mongoose = require("mongoose");
const joiValidate = require("joi");

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  image: String,
  category: String,
});

const productSchemaValidation = joiValidate.object({
  title: joiValidate.string().required(),
  description: joiValidate.string().required(),
  price: joiValidate.number().required(),
  image: joiValidate.string().required(),
  category: joiValidate.string().required(),
});

const Product = mongoose.model("Product", productSchema);

module.exports = { Product, productSchemaValidation };
