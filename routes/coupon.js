const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
         code: String,
         type:String,
         status: String,
         products:Array,
         
         discount: String,
         eligibility: String
})


module.exports = mongoose.model('Coupon', couponSchema);
