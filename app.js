require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const adminRouter = require("./router/adminRoutes");
const userRouter = require('./router/userRoutes')
mongoose.connect("mongodb://127.0.0.1:27017/E-commerceBackend", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
