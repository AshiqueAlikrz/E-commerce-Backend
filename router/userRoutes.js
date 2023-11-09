const express = require("express");
const userRoutes = express.Router();
const controller = require("../controllers/userController.js");
const tryCatch=require('../middleware/tryCatchMiddleware')
const verifyToken = require('../middleware/userAuthMiddleware');

userRoutes.use(express.json());

userRoutes.post("/register",tryCatch(controller.register));
userRoutes.post("/login",tryCatch(controller.userLogin));
userRoutes.get("/:id/cart",tryCatch(controller.getUserCart));
userRoutes.post("/:id/cart",tryCatch(controller.addToCart));
userRoutes.get ("/products",tryCatch(controller.getAllProducts));
userRoutes.get ("/products/:id",tryCatch(controller.getProductsById));
userRoutes.get ("/products/category/:categoryname",tryCatch(controller.getProductsByCategory));
userRoutes.put("/:id/cart",tryCatch(controller.qtyChange));
userRoutes.delete("/:id/cart/:product",tryCatch(controller.deletCart));
userRoutes.post("/:id/wishlist",verifyToken,tryCatch(controller.addToWishlist));
userRoutes.get("/:id/wishlist",verifyToken,tryCatch(controller.getWishList));
userRoutes.delete("/:id/wishlist",verifyToken,tryCatch(controller.deleteWishList));
userRoutes.post("/:id/payment", tryCatch(controller.payment));
userRoutes.get("/payment/success",tryCatch(controller.success));
userRoutes.post("/payment/cancel",tryCatch(controller.cancel));
userRoutes.get("/:id/orders",tryCatch(controller.showOrders));

module.exports = userRoutes;
