const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
          comment:{type:String},
          commentOwner:{type: mongoose.Schema.Types.ObjectId,ref:"User"},
          
})


module.exports = mongoose.model('Review', productSchema);
