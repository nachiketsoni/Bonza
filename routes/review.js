const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
          comment:{type: mongoose.Schema.Types.ObjectId,ref:"Product"},
          commentOwner:{type: mongoose.Schema.Types.ObjectId,ref:"User"},

})


module.exports = mongoose.model('Review', productSchema);
