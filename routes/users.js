const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

mongoose.connect(process.env.MONGODB_URL);

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  pfp: { type: String, default: "Avatar.jpg" },
  gender: {type:String,default: "N.A." },
  number: { type: String, default: "N.A." },
  altNumber:{ type: String, default: "N.A." },
  dob:{ type: String, default: "N.A." },
  secret: String,
  expiry:{
    type:String
  },
  address: [
    {
      type: Object,
    },
  ],
  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
  ],
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  myorder: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

userSchema.plugin(plm, { usernameField: "email" });
userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", userSchema);
