const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

mongoose.connect("mongodb://localhost/bonza");

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  pfp: { type: String, default: "Avatar.jpg" },
  gender: String,
  number: { type: String, default: "N.A." },
  address: [
    {
      type: String,
      ref: "address",
    },
  ],
  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
  ],
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
  ],
  myorder: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
  ],
});

userSchema.plugin(plm, { usernameField: "email" });
userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", userSchema);
