const mongoose = require("mongoose");
const joiValidate = require("joi");

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  price: Number,
  src: String,
  brand: String,
  category: String,
  qty: Number,
});

const productSchemaValidation = joiValidate.object({
  title: joiValidate.string().required(),
  description: joiValidate.string().required(),
  price: joiValidate.number().required(),
  src: joiValidate.string().required(),
  category: joiValidate.string().required(),
  status: joiValidate.string().required(),
  qty: joiValidate.number().required(),
  brand: joiValidate.string().required(),
});

const Product = mongoose.model("Product", productSchema);

module.exports = { Product, productSchemaValidation };
