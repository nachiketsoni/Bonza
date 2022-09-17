const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
          size:{type:String},
          product:{type: mongoose.Schema.Types.ObjectId,ref:"Product"},
          Amt:{type:Number},
          quantity:{type:Number},
})


module.exports = mongoose.model('Cart', cartSchema);
