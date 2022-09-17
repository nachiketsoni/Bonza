var express = require("express");
var router = express.Router();
const passport = require("passport");
const localStrategy = require("passport-local");
const userModel = require("./users");
const prdctModel = require("./product");
const reviewModel = require("./review");
const cartModel = require("./cart");
const path = require("path");
passport.use(
  new localStrategy({ usernameField: "email" }, userModel.authenticate())
);

const cloudinary = require("cloudinary");
const formidable = require("formidable");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const GoogleStrategy = require("passport-google-oauth2").Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // callbackURL: "https://bonzaonstreet.herokuapp.com/google/authenticated",
      callbackURL: "http://localhost:4000/google/authenticated",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      console.log(profile);
      userModel.findOrCreate(
        {
          email: profile.email,
          name: profile.displayName,
        },
        function (err, user) {
          return done(err, user);
        }
      );
    }
  )
);
router.get("/google/auth",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get("/google/authenticated",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

/* GET home page. */
router.get("/login", checkLoggedIn, (req, res, next) => {
  res.render("login");
});
router.post("/login",
  checkLoggedIn,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  (req, res, next) => {}
);

router.post("/register", (req, res) => {
  var newUser = new userModel({
    email: req.body.email,
    name: req.body.name,
    number: req.body.number,
  });
  userModel.register(newUser, req.body.password).then(function (u) {
    passport.authenticate("local")(req, res, () => {
      res.redirect("/");
    });
  });
});
router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
router.get("/", (req, res, next) => {
  res.render("index", { title: "Express" });
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}
function checkLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/profile");
  } else {
    return next();
  }
}
router.get("/product/:id", async (req, res, next) => {
  const product = await prdctModel.findOne({ _id: req.params.id }).populate({
    path: "prdctReview",
    populate: {
      path: "commentOwner",
    },
  });

  if (req.user) {
    var user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart");
  } else {
    var user = null;
  }

  res.render("product", { product, user });
});
router.post("/comment/:id", async (req, res, next) => {
  const user = await userModel.findOne({ email: req.user.email });
  const product = await prdctModel.findOne({ _id: req.params.id });
  const comment = await reviewModel.create({
    comment: req.body.comment,
    commentOwner: user._id,
  });
  product.prdctReview.push(comment._id);
  await product.save();
  console.log(user);
  res.redirect(`/product/${req.params.id}`);
});

router.post("/productUpload", async (req, res, next) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const {
      prdctCtrg,
      prdctName,
      prdctFeatures,
      prdctDesc,
      prdctPrice,
      prdctVideo,
    } = fields;
    const { secure_url } = await cloudinary.v2.uploader.upload(
      files.thumbnail.filepath,
      { folder: prdctName, fetch_format: "webp", quality: "30" }
    );
    const thumbnail = secure_url;
    var allImg = [];
    for (let i = 0; i < files.prdctImg.length; i++) {
      const { secure_url } = await cloudinary.v2.uploader.upload(
        files.prdctImg[i].filepath,
        { folder: prdctName, fetch_format: "webp", quality: "30" }
      );
      allImg.push(secure_url);
    }
    const newProduct = await prdctModel.create({
      prdctCtrg,
      prdctName,
      prdctFeatures,
      prdctDesc,
      prdctPrice,
      prdctVideo,
      thumbnail: thumbnail,
      prdctImg: allImg,
    });

    res.redirect("/store");
    // res.status(200).json(newProduct);
  });
});

router.get("/cart", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({ email: req.user.email }).populate({
    path: "cart",
    populate: {
      path: "product",
    },
  });
  var subtotal = 0;
  user.cart.forEach(function (data) {
    subtotal += parseInt(data.Amt * data.quantity);
  });
  // res.json(user)
  console.log(user);
  res.render("cart", { user, subtotal });
});
router.get("/checkout", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({ email: req.user.email }).populate({
    path: "cart",
    populate: {
      path: "product",
    },
  });
  var subtotal = 0;
  user.cart.forEach(function (data) {
    subtotal += parseInt(data.Amt * data.quantity);
  });
  res.render("checkout", { user, subtotal });
});
router.get("/store", async (req, res, next) => {
  const allProduct = await prdctModel.find();
  try {
    const user = await userModel.findOne({ email: req.user.email });
    res.render("store", { allProduct, user });
  } catch {
    res.render("store", { allProduct });
  }
});
// router.get("/story", async (req, res, next) => {
//   const allProduct = await prdctModel.find();
//   if(req.user){ var user = await userModel.findOne({email:req.user.email}).populate("cart")
// }else{var user = null}
//   res.status(200).json({user,allProduct})
// });
router.get("/story/:ctrg", async (req, res, next) => {
  let allProduct = null;
  if (req.params.ctrg == "all") {
    allProduct = await prdctModel.find();
  } else {
    allProduct = await prdctModel.find({ prdctCtrg: req.params.ctrg });
  }
  if (req.user) {
    var user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart");
  } else {
    var user = null;
  }
  res.status(200).json({ user, allProduct });
});

router.get("/admin", (req, res, next) => {
  res.render("admin");
});
router.get("/about", (req, res, next) => {
  res.render("about");
});
router.get("/loggedinUser", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({ email: req.user.email });
  res.json(user);
});
router.get("/wishlist", isLoggedIn, async (req, res, next) => {
  const user = await userModel
    .findOne({ email: req.user.email })
    .populate("wishlist");
  res.render("wishlist", { user });
});
router.get("/wishlist/remove/:id", isLoggedIn, async (req, res, next) => {
  const user = await userModel
    .findOne({ email: req.user.email })
    .populate("wishlist");
  user.wishlist.splice(user.wishlist.indexOf(req.params.id), 1);
  await user.save();
  res.redirect("back");
});
router.get("/profile", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({ email: req.user.email });

  res.render("profile", { user });
});
router.get("/addToWish/:id", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({ email: req.user.email });
  const product = await prdctModel.findOne({ _id: req.params.id });
  console.log(user.wishlist.includes(req.params.id));
  if (!user.wishlist.includes(req.params.id)) {
    user.wishlist.push(product);
    await user.save();
    res.json({ status: "added", wishlist: user.wishlist });
  } else {
    user.wishlist.splice(user.wishlist.indexOf(req.params.id), 1);
    await user.save();

    res.json({ status: "removed", wishlist: user.wishlist });
  }
});
router.post("/addToCart/:id", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({ email: req.user.email }).populate({
    path: "cart",
    populate: {
      path: "product",
    },
  });
  const product = await prdctModel.findOne({ _id: req.params.id });
  const carts = await cartModel.find();
  
  
  

    const search = (item , i)=>{
      if(item.product._id.toString() == product._id.toString() && item.size == req.body.size ){
        return i
      }
      else{
        return -1
      }
    }
    const lolo = user.cart.findIndex(search)
  if(lolo != -1){
    
    console.log(lolo);
    user.cart[lolo].quantity++;
    console.log(user);
  }
  else if (carts.findIndex(search) != -1){
    console.log(carts);
    console.log(carts.findIndex(search));
    user.cart.push(carts[carts.findIndex(search)]._id);
    await user.save();
  }
  else{

    const cart = await cartModel.create({
      size: req.body.size,
      quantity: req.body.quantity,
      Amt: req.body.price,
      product: product._id,
  });
  user.cart.push(cart._id);
  await user.save();

  }
  res.redirect("back");
});
router.get("/cart/delete/:id",isLoggedIn,async (req,res,next)=>{
  const cart = await cartModel.findOneAndDelete({_id: req.params.id})
  const user = await userModel.findOne({ email: req.user.email }).populate({
    path: "cart",
    populate: {
      path: "product",
    },
  });
  user.cart.splice(user.cart.indexOf(cart._id),1)
  await user.save()
  res.redirect("back")
})
router.get("/removecomment/:product/:comment",
  isLoggedIn,
  async (req, res, next) => {
    const product = await prdctModel.findOne({ _id: req.params.product });

    await reviewModel.findByIdAndDelete({ _id: req.params.comment });
    product.prdctReview.splice(
      product.prdctReview.indexOf(req.params.comment),
      1
    );
    await product.save();
    res.redirect("back");
  }
);

module.exports = router;
