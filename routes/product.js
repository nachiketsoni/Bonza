const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  prdctCtrg: String,
  prdctName: String,
  prdctDesc: String,
  prdctFeatures: Array,
  prdctPrice: String,
  prdctVideo: String,
  thumbnail: Object,
  prdctImg: Array,
  prdctReview: [{
     comment:{type:String},
     commentOwner:{type: mongoose.Schema.Types.ObjectId,ref:"User"},
    }],
});

module.exports = mongoose.model("Product", productSchema);
