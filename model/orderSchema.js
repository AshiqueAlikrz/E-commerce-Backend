const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  products: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      qty: Number,
    },
  ],
  date: { type: String, default: new Date().toLocaleDateString() },
  order_id: String,
  payment_id: String,
  total_amount: String,
});

module.exports = mongoose.model("Order", orderSchema);
