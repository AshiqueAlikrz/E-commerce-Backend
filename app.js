require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const adminRouter = require("./router/adminRoutes");
const userRouter = require('./router/userRoutes')
const cors = require('cors');


mongoose.connect("mongodb://127.0.0.1:27017/E-commerceBackend", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
