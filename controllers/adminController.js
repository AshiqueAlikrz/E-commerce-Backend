const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../model/userSchema");
const Product = require("../model/productSchema");

module.exports = {
  login: async (req, res) => {
    const { username, password } = req.body;
    console.log(process.env.ADMIN_USERNAME);
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { username: username },
        process.env.ADMIN_ACCESS_TOKEN_SECRET
      );
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
      const { title, description, price, image, category } = req.body;

      const product = await Product.create({
        title,
        description,
        price,
        image,
        category,
      });

      console.log("Product created:", product);
      res
        .status(201)
        .json({ message: "Product created successfully", product });
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
    const { title, description, price, image, category, id } = req.body;
    console.log(id);
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ error: "Product not found" });
    } else {
      await Product.updateOne(
        { _id: id },
        {
          $set: {
            title: title,
            description: description,
            price: price,
            image: image,
            category: category,
          },
        }
      );
      res.status(201).json({
        status: "success",
        message: "Successfully updated the product.",
      });
    }
  },
  DeleteProduct: async (req, res) => {
    const { id } = req.body;
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
    const aggregation = User.aggregate([
      { $unwind: "$orders" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$orders.totalamount" }, 
          totalItemsSold: { $sum: { $size: "$orders.product" }} 
        },
      },
    ]);
    console.log(aggregation);
    const result=await aggregation.exec();
    const totalRevenue=result[0].totalRevenue;
    const totalItemsSold=result[0].totalItemsSold;

    res.status(200).json({
      status:"success",
      message:"successfully fetched stats",
      data:{
        "Total Revenue": totalRevenue,
          "Toal Item Sold": totalItemsSold
      }
    })
  },
};

//admin controller
