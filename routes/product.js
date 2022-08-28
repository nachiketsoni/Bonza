const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  prdctCtrg:String,
  prdctName:String, 
  prdctDesc:String, 
  prdctPrice:String, 
  prdctVideo:String, 
  prdctImg:Array,
  

  });

module.exports = mongoose.model('Product', productSchema);