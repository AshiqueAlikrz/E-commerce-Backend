const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User } = require("../model/userSchema");
const { Product, productSchemaValidation } = require("../model/productSchema");
const cloudinary = require("../utils/cloudinary");


const Order = require("../model/orderSchema");

module.exports = {
  login: async (req, res) => {
    const { email, password } = req.body;
    console.log(process.env.ADMIN_EMAIL);
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email: email }, process.env.ADMIN_ACCESS_TOKEN_SECRET);
      res.status(200).json({
        status: "success",
        message: "Admin Successfully logged In.",
        data: { jwt_token: token },
      });
    } else {
      return res.status(404).json({
        status: "error",
        message: "Not an Admin",
      });
    }
  },

  getAllusers: async (req, res) => {
    const allusers = await User.find();

    res.status(200).json({
      status: "success",
      message: "Successfully fetched user datas.",
      data: allusers,
    });
  },

  getById: async (req, res) => {
    const id = req.params.id;
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { error, value } = productSchemaValidation.validate(req.body);
      if (error) {
        console.log("hi error");
        return res.status(400).json({
          status: "error",
          message: error.details[0].message,
        });
      }
      const { title, description, status, price, src, category, brand, qty } = value;


      const product = await Product.create({
        title,
        description,
        status,
        price,
        src,
        brand,
        category,
        qty,
      });

      console.log("Product created:", product);
      res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getproductById: async (req, res) => {
    const id = req.params.id;
    try {
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  AllProducts: async (req, res) => {
    allProducts = await Product.find();
    res.status(200).json({
      status: "success",
      message: "All Products",
      data: allProducts,
    });
  },

  UpdateProduct: async (req, res) => {
    const { title, description, price, category, id, src, qty, status, brand } = req.body;
    const product = await Product.findById(id);
    console.log(product);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
    } else {
      const pushProduct = await Product.updateOne(
        { _id: id },
        {
          $set: {
            title: title,
            description: description,
            src: src,
            price: price,
            brand: brand,
            qty: qty,
            status: status,
            category: category,
          },
        }
      );
      res.status(201).json({
        status: "success",
        message: "Successfully updated the product.",
        data: pushProduct,
      });
      console.log("pushProduct", pushProduct);
    }
  },
  DeleteProduct: async (req, res) => {
    const id = req.params.id;
    await Product.findByIdAndDelete(id);
    res.status(201).json({
      status: "success",
      message: "Successfully deleted the product.",
    });
  },
  getproductByCategory: async (req, res) => {
    const SortCatg = req.query.category;
    console.log(SortCatg);
    const products = await Product.find({ category: SortCatg });
    if (!products) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Successfully fetched product details.",
      data: products,
    });
  },
  stats: async (req, res) => {
    const aggregation = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalItemsSold: {
            $sum: {
              $cond: [{ $isArray: "$products" }, { $size: "$products" }, 0],
            },
          },
          totalRevenue: { $sum: { $toDouble: "$total_amount" } },
        },
      },
      { $project: { _id: 0 } },
    ]);

    res.status(200).json({
      status: "success",
      message: "successfully fetched stats",
      data: aggregation,
    });
  },
  
  AdminShowOrders: async (req, res) => {
    const orders = await Order.find();
    if (orders) {
      res.status(200).json({
        status: "success",
        message: "successfully fetched the order",
        data: orders,
      });
    } else res.status(404).json({ message: "order not found" });
  },
};
