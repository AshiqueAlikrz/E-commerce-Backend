const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Product = require("../model/productSchema");
const Order = require("../model/orderSchema");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bcrypt = require("bcrypt");
const {
  User,
  userRegisterValidation,
  userLoginValidation,
} = require("../model/userSchema");

let successValues = {};

// user registrater a account POST api/user/register

module.exports = {
  register: async (req, res) => {
    try {
      const { error, value } = userRegisterValidation.validate(req.body);

      if (error) {
        return res.status(400).json({
          status: "error",
          message: error.details[0].message,
        });
      }

      const { name, email, username, password } = value;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "Email already exists.",
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        // console.log(name, email, username, password)
        await User.create({
          name: name,
          email: email,
          username: username,
          password: hashedPassword,
        });

        res.status(201).json({
          status: "success",
          message: "User registration successful.",
        });
      }
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  },

  // user login account POST api/user/login

  userLogin: async (req, res) => {
    const { error, value } = userLoginValidation.validate(req.body);
    try {
      if (error) {
        return res.status(400).json({
          status: "error",
          message: error.details[0].message,
        });
      }

      const { email, password } = value;
      const user = await User.findOne({ email });
      // console.log("body pass", user);

      if (user) {
        const comparePassword = await bcrypt.compare(password, user.password);
        console.log("db pass", comparePassword);
        if (comparePassword) {
          const token = jwt.sign(
            { email },
            process.env.USER_ACCESS_TOKEN_SECRET
          );
          res.status(200).json({
            status: "success",
            message: "successfully logged in",
            data: { jwt_token: token },
          });
        } else
          res.status(500).json({
            status: "incorrect password",
          });
      } else {
        res.status(401).json({ message: "Invalid username or password" });
      }
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },

 //show all the products GET api/user/products

  getAllProducts: async (req, res) => {
    const products = await Product.find();
    res.status(200).json({
      status: "success",
      message: "All products fetched for user",
      data: products,
    });
  },

   //show  products by id GET api/user/products/:id

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
    // console.log(product);
  },

   //show  products by category GET api/user/products/category/categoryname

  getProductsByCategory: async (req, res) => {
    const category = req.params.categoryname;
    const product = await Product.find({category });
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

  //add product to the cart  POST api/user/:id/cart

  addToCart: async (req, res) => {
    try {
      const userId = req.params.id;
      const productId = req.body.id;
      const product = await Product.findById(productId);
      // console.log(product);
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

  //show the product GET api/user/:id/cart

  getUserCart: async (req, res) => {
    const id = req.params.id;
    const cart = await User.findOne({ _id: id }).populate("cart");
    // console.log(cart);
    if (!cart) {
      res.status(404).json({ message: "not found" });
    } else
      res.status(200).json({
        status: "success",
        message: "cart of this user",
        data: cart,
      });
  },

//add to wishlist POST api/user/:id/wishlist

  addToWishlist: async (req, res) => {
    const id = req.params.id;
    const productId = req.body.id;
    if (productId) {
      const wishlist = await User.findByIdAndUpdate(
        { _id: id },
        { $push: { wishlist: productId } }
      );

      // console.log(wishlist);
      res
        .status(200)
        .json({ status: "added to wishlist succesfully", data: wishlist });
    } else res.status(404).json({ error: "Error updating wishlist" });
  },

  //show the product GET api/user/:id/wishlist

  getWishList: async (req, res) => {
    const id = req.params.id;
    const wishlist = await User.findById(id).populate("wishlist");
    // console.log(wishlist);
    if (!wishlist) {
      res.status(404).json({ message: "not found" });
    } else
      res.status(200).json({
        status: "success",
        message: "cart of this user",
        data: wishlist,
      });
  },

// delete from the wishlist DELETE api/user/:id/wishlist

  deleteWishList: async (req, res) => {
    const id = req.params.id;
    const productId = req.body.id;
    if (productId) {
      const deleteWish = await User.findByIdAndUpdate(
        { _id: id },
        { $pull: { wishlist: productId } }
      );

      // console.log(deleteWish);
      res.status(200).json({ status: "item deleted from wishlist" });
    } else res.status(404).json({ error: "Error updating wishlist" });
  },

  //delete from cart DELETE api/user/:id/cart

  deletCart: async (req, res) => {
    const id = req.params.id;
    const productId = req.body.id;
    if (productId) {
      const deleteCart = await User.findByIdAndDelete(
        { _id: id },
        { $pull: { cart: productId } }
      );

      res.status(200).json({ status: "item deleted from cart" });
    } else
      res
        .status(404)
        .json({ error: "Error updating wishlist", data: deleteCart });
  },

  //payment section POST api/user/:id/payment

  payment: async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id).populate("cart"); //user with cart
    if (!user) {
      return res.status(404).json({ message: "user not found " });
    }
    const cartItems = user.cart;
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const lineItems = cartItems.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.title,
            description: item.description,
          },
          unit_amount: Math.round(item.price * 100), // when item.price only given ,error occur, why ? check its reason . why multiply 100
        },
        quantity: 1,
      };
    });

    // //declaring session as global variable

    session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], //, 'apple_pay', 'google_pay', 'alipay',card
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/api/user/payment/success", // Replace with your success URL
      cancel_url: "http://localhost:3000/api/user/payment/cancel", // Replace with your cancel URL
    });

    if (!session) {
      return res.json({
        status: "Failure",
        message: " Error occured on  Session side",
      });
    }

    successValues = {
      id,
      user,
      newOrder: {
        products: user.cart.map(
          (product) => new mongoose.Types.ObjectId(product.id)
        ),
        order_id: Date.now(),
        payment_id: session.id,
        total_amount: session.amount_total / 100,
      },
    };
    // console.log("successValues",successValues);
    res.status(200).json({
      status: "Success",
      message: "Strip payment session created",
      url: session.url,
    });
  },

  success: async (req, res) => {
    const { id, user, newOrder } = successValues;
    console.log("neworder:", newOrder);
    await Order.create({ ...newOrder });
    console.log("odersssss", order);
    await User.findByIdAndUpdate({ _id: id }, { $push: { orders: order._id } });
    user.cart = [];
    await user.save();

    res.status(200).json({
      status: "success",
      message: "successfully added in order",
    });
  },
  cancel: async (req, res) => {
    res.json("cancel");
  },

  //show order details GET api/user/:id/orders

  showOrders: async (req, res) => {
    const id = req.params.id;
    const showOrderproducts = await User.findById(id).populate("orders");
    if (!id) {
      res.status(404).json({ error, message: "user not found" });
    } else {
      res.status(200).json({
        status: "success",
        message: "successfully fetched",
        data: showOrderproducts,
      });
    }
    // console.log(showOrderproducts);
  },
};
