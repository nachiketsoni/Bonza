var express = require("express");
var router = express.Router();
const passport = require("passport");
const localStrategy = require("passport-local");
const userModel = require("./users");
const prdctModel = require("./product");
const multer = require("multer");
const path = require("path");
const { log } = require("console");
passport.use(
  new localStrategy({ usernameField: "email" }, userModel.authenticate())
);

const GoogleStrategy = require("passport-google-oauth2").Strategy;
const GOOGLE_CLIENT_ID =
  "440162361558-a6g5bialhgo794bqbouv2fq2jjlvhrqg.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
       
      // callbackURL: "https://bonzaonstreet.herokuapp.com/google/authenticated",
      callbackURL: "http://localhost:3000/google/authenticated",
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
router.get(
  "/google/auth",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/authenticated",
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
router.post(
  "/login",
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
  const product = await prdctModel.findOne({ _id: req.params.id });
  res.render("product", { product });
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/viaMulter");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});
function fileFilter(req, file, cb) {
  if (
    file.mimetype.split("/")[1] === "png" ||
    file.mimetype.split("/")[1] === "jpg" ||
    file.mimetype.split("/")[1] === "jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

router.post(
  "/productUpload",
  upload.array("prdctImg", 10),
  async (req, res, next) => {
    const newProduct = await prdctModel.create({
      prdctCtrg: req.body.prdctCtrg,
      prdctName: req.body.prdctName,
      prdctFeatures:req.body.prdctFeatures,
      prdctDesc: req.body.prdctDesc,
      prdctPrice: req.body.prdctPrice,
      prdctVideo: req.body.prdctVideo,
      prdctImg: req.files,
    });

    res.redirect("/store");
  }
);

router.get("/cart", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({email:req.user.email}).populate("cart");
  // res.json(user)
  res.render("cart", {user});
});
router.get("/store", async (req, res, next) => {
  const allProduct = await prdctModel.find();
  try{
    const user = await userModel.findOne({email:req.user.email});

    res.render("store", { allProduct, user });
  }
  catch{
    
    res.render("store", { allProduct});
  }
});
router.get("/admin", (req, res, next) => {
  res.render("admin");
});
router.get("/checkout", isLoggedIn, (req, res, next) => {
  res.render("checkout");
});
router.get("/about", isLoggedIn, (req, res, next) => {
  res.render("about");
});
router.get("/loggedinUser", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({email:req.user.email});
  res.json(user);
});
router.get("/wishlist", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({email:req.user.email}).populate("wishlist")
  res.render("wishlist",{user})
});
router.get("/wishlist/remove/:id", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({email:req.user.email}).populate("wishlist")
  user.wishlist.splice(user.wishlist.indexOf(req.params.id), 1);
  await user.save();
  res.redirect("back")
});
router.get("/profile", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({email:req.user.email});
 
  res.render("profile", { user });
});
router.get("/addToWish/:id", isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({email:req.user.email});
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
  const user = await userModel.findOne({email:req.user.email});
  const product = await prdctModel.findOne({ _id: req.params.id });

  if (!user.cart.includes(req.params.id)) {
    user.cart.push(product);
    await user.save();
    
  } else {  
    user.cart.splice(user.cart.indexOf(req.params.id), 1);
    await user.save();
  }
  res.redirect("back")
});


module.exports = router;
