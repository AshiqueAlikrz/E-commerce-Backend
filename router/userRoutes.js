const express = require("express");
const userRoutes = express.Router();
const controller = require("../controllers/userController.js");
const tryCatch=require('../middleware/tryCatchMiddleware')
const verifyToken = require('../middleware/userAuthMiddleware');

userRoutes.use(express.json());

userRoutes.post("/register",tryCatch(controller.register));
userRoutes.post("/login",tryCatch(controller.userLogin));
userRoutes.get ("/products",verifyToken,tryCatch(controller.getAllProducts));
userRoutes.get ("/products/:id",verifyToken,tryCatch(controller.getProductsById));
userRoutes.get ("/products/category/:categoryname",verifyToken,tryCatch(controller.getProductsByCategory));
userRoutes.post("/:id/cart",verifyToken,tryCatch(controller.addToCart));
userRoutes.get("/:id/cart",verifyToken,tryCatch(controller.getUserCart));
userRoutes.delete("/:id/cart",verifyToken,tryCatch(controller.deletCart));
userRoutes.post("/:id/wishlist",verifyToken,tryCatch(controller.addToWishlist));
userRoutes.get("/:id/wishlist",verifyToken,tryCatch(controller.getWishList));
userRoutes.delete("/:id/wishlist",verifyToken,tryCatch(controller.deleteWishList));


userRoutes.post("/:id/payment", verifyToken, tryCatch(controller.payment));
userRoutes.get("/payment/success",tryCatch(controller.success));
userRoutes.post("/payment/cancel",tryCatch(controller.cancel));

module.exports = userRoutes;
