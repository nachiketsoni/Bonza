const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URL);

const userSchema = new mongoose.Schema({
  email: {type :String , unique:true , required:true},
  name: {type :String ,  required:true},

  pfp: {
    public_id: {
      type: String,
      default: "default/Avatar_tictb7.png",
      required: true,
    },
    url: {
      type: String,
      default:
        "https://res.cloudinary.com/bonzaonstreet/image/upload/v1665566731/default/Avatar_tictb7.png",

      required: true,
    },
  },
  gender: { type: String, default: "N.A." },
  number: { type: Number, default: "N.A." },
  altNumber: { type: Number, default: "N.A." },
  dob: { type: String, default: "N.A." },
  secret: String,
  expiry: {
    type: String,
  },
  address: [
    {
      type: Object,
    },
  ],
  cart: [
    {
      size: { type: String },
      quantity: { type: Number },
      Amt: { type: Number },
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
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
      ref: "Order",
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  otp: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

userSchema.plugin(plm, { usernameField: "email" });
userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", userSchema);
