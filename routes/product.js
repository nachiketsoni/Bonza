const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  prdctCtrg: String,
  prdctName: String,
  prdctDesc: String,
  prdctFeatures: Array,
  prdctPrice: Number,
  prdctImg: Array,
  MRP:{type:Number,default:0,required:true},
  delivery:{type:Number,default:0,required:true},
  sell:{type:Number,default:0,required:true},
  stock:{type:Number,default:0,required:true},
  sizes: Array,
  prdctReview: [{
     comment:{type:String},
     commentOwner:{type: mongoose.Schema.Types.ObjectId,ref:"User"},
    }],
});

module.exports = mongoose.model("Product", productSchema);
