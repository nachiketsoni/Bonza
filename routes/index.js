var express = require("express");
var router = express.Router();
const passport = require("passport");
const localStrategy = require("passport-local");
const userModel = require("./users");
const prdctModel = require("./product");
const multer = require('multer')
const path =  require('path')
passport.use(new localStrategy(userModel.authenticate()));
require("./googleAuth");






const GoogleStrategy = require("passport-google-oauth2").Strategy;
const GOOGLE_CLIENT_ID ="440162361558-a6g5bialhgo794bqbouv2fq2jjlvhrqg.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/google/authenticated",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      console.log(profile);
      userModel.findOrCreate(
        {
          username: profile.email,
          name: profile.displayName,
        },
        function (err, user) {
          return done(err, user);
        }
      );
    }
  )
);
router.get("/google/auth",passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/authenticated",passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);



/* GET home page. */
router.get("/login", checkLoggedIn, function (req, res, next) {
  res.render("login");
});
router.post("/login",passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  function (req, res, next) {}
);



router.post("/register", function (req, res) {
  var newUser = new userModel({
    username: req.body.username,
    name: req.body.name,
    number: req.body.number,
  });
  userModel.register(newUser, req.body.password).then(function (u) {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/");
    });
  });
});
router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
router.get("/", function (req, res, next) {
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
    res.redirect("/");
  } else {
    return next();
  }
}

router.get("/product", function (req, res, next) {
  res.render("product");
});
const storage = multer.diskStorage({
  destination:(req,file,cb) =>{
    cb(null , './public/images/viaMulter');
  },
  filename:(req,file,cb) =>{
    cb(null, file.fieldname + Date.now() +  path.extname(file.originalname))
  },
})
const upload = multer({
  storage:storage,
  fileFilter: fileFilter
})
function fileFilter (req, file, cb) {
  if(file.mimetype.split('/')[1] === 'png' || file.mimetype.split('/')[1] === 'jpg' || file.mimetype.split('/')[1] === 'jpeg'){
    cb(null, true)
  }
  else{
    cb(null, false)
  }
}

router.post("/productUpload",upload.array('prdctImg', 4),async (req, res, next)=> {
    
    const newProduct = await prdctModel.create({
  prdctCtrg:req.body.prdctCtrg,
  prdctName:req.body.prdctName, 
  prdctDesc:req.body.prdctDesc, 
  prdctPrice:req.body.prdctPrice, 
  prdctVideo:req.body.prdctVideo, 
  prdctImg:req.files,
  
    })

    
    res.redirect('/store')
});



router.get("/cart",isLoggedIn,async function (req, res, next) {
  const user = await userModel.findOne(req.user)
  res.render("cart"); 
});
router.get("/store",async function (req, res, next) {
  const allProduct = await prdctModel.find()
  res.render("store", {allProduct});
});
router.get("/admin", function (req, res, next) {
  res.render("admin");
});
router.get("/checkout",isLoggedIn, function (req, res, next) {
  res.render("checkout");
});

module.exports = router;
