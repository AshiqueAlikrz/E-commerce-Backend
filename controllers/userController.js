const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Product } = require("../model/productSchema");
const Order = require("../model/orderSchema");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bcrypt = require("bcrypt");
const { User, userRegisterValidation, userLoginValidation } = require("../model/userSchema");

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
      // console.log(value);

      const { name, email, username, password } = value;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "Email already exists.",
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log(hashedPassword);
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
      // console.log(value);
      const user = await User.findOne({ email });
      // console.log("body pass", user);

      if (user) {
        const comparePassword = await bcrypt.compare(password, user.password);

        if (comparePassword) {
          const token = jwt.sign({ email }, process.env.USER_ACCESS_TOKEN_SECRET);
          // console.log(token)
          return res.status(200).json({
            status: "success",
            message: "successfully logged in",
            data: { jwt_token: token, id: user._id, name: user.username, cart: user.cart },
          });
        } else {
          return res.status(500).json({
            status: "incorrect password",
          });
        }
      } else {
        return res.status(401).json({ message: "Invalid username or password" });
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
    console.log("getProductsById", id);
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    } else res.status(200).json({ status: "success", message: "Product found", data: product });
    // console.log(product);
  },

  //show  products by category GET api/user/products/category/categoryname

  getProductsByCategory: async (req, res) => {
    const category = req.params.categoryname;
    const product = await Product.find({ category });
    if (!product) {
      res.status(404).json({
        status: "error",
        message: "product not found",
      });
    } else res.status(200).json({ status: "success", message: "Product found", data: product });
  },

  //add product to the cart  POST api/user/:id/cart

  addToCart: async (req, res) => {
    try {
      const userId = req.params.id;
      const productId = req.body.id;
      // console.log("userId",userId);
      // console.log("productIdsss",productId);
      const existProduct = await User.findOne({ _id: userId, cart: { $elemMatch: { product: productId } } });
      if (existProduct) {
        console.log("existProduct", existProduct);
        return res.status(200).json({ message: "already in cart" });
      } else {
        const product = await Product.findById(productId);
        // console.log(product);
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        const hello = await User.findByIdAndUpdate({ _id: userId }, { $addToSet: { cart: { product: product } } });
        // console.log("hello", hello);
        const updatedUser = await User.findById(userId);
        // console.log("updatedUser",updatedUser);
        return res.status(200).json({ message: "Product added to cart", user: updatedUser });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  qtyChange: async (req, res) => {
    const userId = req.params.id;
    const { id, num } = req.body;

    console.log("userid", userId, "num", num, "productId", id);

    const user = await User.findById(userId);

    if (!userId) {
      res.status(404).json({ error: error.message });
    }

    const updatedQty = (user.cart.id(id).qty += num);
    console.log("updatedQty", updatedQty);

    // await User.updateOne({ _id: userId, "cart._id": id }, { $set: { "cart.qty": updatedQty } });
    if (updatedQty > 0) {
      console.log("object");
      await user.save();
    }

    res.status(200).json({ status: "success", message: "Cart item quantity updated", data: user.cart });
  },

  //show the product GET api/user/:id/cart

  getUserCart: async (req, res) => {
    const id = req.params.id;
    // console.log("getId",id);
    const cart = await User.findOne({ _id: id }).populate("cart.product");
    // console.log("cart",cart);
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
      const wishlist = await User.findByIdAndUpdate({ _id: id }, { $push: { wishlist: productId } });

      // console.log(wishlist);
      res.status(200).json({ status: "added to wishlist succesfully", data: wishlist });
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
      const deleteWish = await User.findByIdAndUpdate({ _id: id }, { $pull: { wishlist: productId } });

      // console.log(deleteWish);
      res.status(200).json({ status: "item deleted from wishlist" });
    } else res.status(404).json({ error: "Error updating wishlist" });
  },

  //delete from cart DELETE api/user/:id/cart

  deletCart: async (req, res) => {
    try {
      const userId = req.params.id;
      const productId = req.params.product;
      console.log("userId", userId);
      console.log("productId", productId);

      if (productId) {
        const deleteCart = await User.findByIdAndUpdate(
          { _id: userId },
          { $pull: { cart: { _id: productId } } },
          { new: true }
        );
        if (deleteCart) {
          res.status(200).json({ status: "item deleted from cart", data: deleteCart });
        } else {
          res.status(404).json({ error: "Error updating cart" });
        }
      } else {
        res.status(404).json({ error: "Invalid product ID" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  //payment section POST api/user/:id/payment

  payment: async (req, res) => {
    const id = req.params.id;
    console.log("cartItems product paymnet id", id);
    const user = await User.findById(id).populate("cart.product");

    if (!user) {
      return res.status(404).json({ message: "user not found " });
    }
    const cartItems = user.cart;
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }
    console.log("cartItems product paymnet", cartItems);

    const lineItems = cartItems.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.product.title,
            description: item.product.description,
          },
          unit_amount: Math.round(item.product.price * 100), // when item.price only given ,error occur, why ? check its reason . why multiply 100
        },
        quantity: item.qty,
      };
    });

    // //declaring session as global variable

    session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], //, 'apple_pay', 'google_pay', 'alipay',card
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/payment/success", // Replace with your success URL
      cancel_url: "http://localhost:3000/payment/cancel", // Replace with your cancel URL
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
        products: user.cart.map((product) => ({
          product_id: new mongoose.Types.ObjectId(product.product._id),
          qty: product.qty,
        })),
        order_id: Date.now(),
        payment_id: session.id,
        total_amount: session.amount_total / 100,
      },
    };

    console.log("succsval", successValues);
    res.status(200).json({
      status: "Success",
      message: "Strip payment session created",
      url: session.url,
    });
  },

  success: async (req, res) => {
    const { id, user, newOrder } = successValues;
    // console.log("neworder:","id",id,"user", user,newOrder);

    const order = await Order.create({ ...newOrder });
    console.log("orderSchema", order);
    await User.findByIdAndUpdate({ _id: id }, { $push: { orders: order._id } });
    user.cart = [];
    await user.save();

    res.status(200).json({
      status: "success",
      message: "successfully added in order",
      data: order,
    });
  },
  cancel: async (req, res) => {
    res.json("cancel");
  },

  //show order details GET api/user/:id/orders

  showOrders: async (req, res) => {
    const id = req.params.id;
    const showOrderproducts = await User.findById(id).populate("orders");
    const LastOrders = showOrderproducts.orders;
    // console.log(showOrderproducts);
    if (!id) {
      res.status(404).json({ error, message: "user not found" });
    } else {
      const orderDetails = await Order.find({
        _id: { $in: LastOrders },
      }).populate("products");
      res.status(200).json({
        status: "success",
        message: "successfully fetched",
        data: orderDetails,
      });
    }
    // console.log(showOrderproducts);
  },
};
