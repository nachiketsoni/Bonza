const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  prdctCtrg: String,
  prdctName: String,
  prdctDesc: String,
  prdctFeatures: String,
  prdctPrice: String,
  prdctVideo: String,
  thumbnail: Object,
  prdctImg: Array,
  prdctReview: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
});

module.exports = mongoose.model("Product", productSchema);
