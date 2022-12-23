const mongoose = require("mongoose");

const Order = new mongoose.Schema({
  orderNum: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  orderID: { type: String, required: true },
  Email: { type: String, required: true },
  phnNum: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), required: true },
  payment: {
    type: Object,
    required: true,
  },
  Address: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    location: { type: String, required: true },
    id: { type: String, required: true },
  },

  items: [
    {
      Amt: { type: Number },
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number },
      size: { type: String },
    },
  ],
  status: { type: String, required: true },
  DeliveryInstructions: { type: String },
});

module.exports = mongoose.model("Order", Order);
