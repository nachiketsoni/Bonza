const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  prdctCtrg:String,
  prdctName:String, 
  prdctDesc:String, 
  prdctPrice:String, 
  prdctVideo:String, 
  prdctImg:Array,
  prdctReview:[{type:mongoose.Schema.Types.ObjectId,ref:"Review"}]

  });

module.exports = mongoose.model('Product', productSchema);