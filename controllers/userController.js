const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const Product = require("../model/productSchema");

module.exports = {
  register: async (req, res) => {
    const { name, email, username, password } = req.body;
    await User.create({
      name: name,
      email: email,
      username: username,
      password: password,
    });
    res.status(201).json({
      status: "success",
      message: "user registration successfull.",
    });
  },

  userLogin: async (req, res) => {
    const { username, password } = req.body;
    const user = { username, password };
    if (user) {
      const token = jwt.sign(
        { username },
        process.env.USER_ACCESS_TOKEN_SECRET
      );
      res.status(200).json({
        status: "sucess",
        message: "successfully logged in",
        data: { jwt_token: token },
      });
    } else res.status(401).json({ message: "Invalid username or password" });
  },

  getAllProducts: async (req, res) => {
    const products = await Product.find();
    res.status(200).json({
      status: "success",
      message: "All products fetched for user",
      data: products,
    });
  },
  getProductsById: async (req, res) => {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    } else
      res
        .status(200)
        .json({ status: "success", message: "Product found", data: product });
    console.log(product);
  },
  getProductsByCategory: async (req, res) => {
    const category = req.params.categoryname;
    const product = await Product.find({ category: category });
    if (!product) {
      res.status(404).json({
        status: "error",
        message: "product not found",
      });
    } else
      res
        .status(200)
        .json({ status: "success", message: "Product found", data: product });
  },

  addToCart: async (req, res) => {
    try {
      const userId = req.params.id;
      const productId = req.body.id;
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { cart: product } }
      );
      const updatedUser = await User.findById(userId);
      return res
        .status(200)
        .json({ message: "Product added to cart", user: updatedUser });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getUserCart: async (req, res) => {
    const id = req.params.id;
    const cart = await User.findOne({ _id: id }).populate("cart");
    console.log(cart);
    if (!cart) {
      res.status(404).json({ message: "not found" });
    } else
      res.status(200).json({
        status: "success",
        message: "cart of this user",
        data: cart,
      });
  },

  addToWishlist: async (req, res) => {
    const id = req.params.id;
    const productId = req.body.id;
    if (productId) {
      const wishlist = await User.findByIdAndUpdate(
        { _id: id },
        { $push: { wishlist: productId } }
      );

      console.log(wishlist);
      res
        .status(200)
        .json({ status: "added to wishlist succesfully", data: wishlist });
    } else res.status(404).json({ error: "Error updating wishlist" });
  },

  getWishList: async (req, res) => {
    const id = req.params.id;
    const wishlist = await User.findById(id).populate("wishlist");
    console.log(wishlist);
    if (!wishlist) {
      res.status(404).json({ message: "not found" });
    } else
      res.status(200).json({
        status: "success",
        message: "cart of this user",
        data: wishlist,
      });
  },
  deleteWishList: async (req, res) => {
    const id = req.params.id;
    const productId = req.body.id;
    if (productId) {
      const deleteWish = await User.findByIdAndUpdate(
        { _id: id },
        { $pull: { wishlist: productId } }
      );

      console.log(deleteWish);
      res.status(200).json({ status: "item deleted from wishlist"});
    } else res.status(404).json({ error: "Error updating wishlist" });
  },
  deletCart: async (req, res) => {
    const id = req.params.id;
    const productId = req.body.id;
    if (productId) {
      const deleteCart = await User.findByIdAndDelete(
        { _id: id },
        { $pull: { cart: productId } }
      );

      res.status(200).json({ status: "item deleted from cart"});
    } else res.status(404).json({ error: "Error updating wishlist" ,data:deleteCart});
  },
};
