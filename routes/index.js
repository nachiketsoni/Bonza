var express = require("express");
var router = express.Router();
const passport = require("passport");
const localStrategy = require("passport-local");
const userModel = require("./users");
const prdctModel = require("./product");
const path = require("path");
const Razorpay = require("razorpay");
const { v4: uuidv4 } = require("uuid");
const sendMail = require("../nodemailer.js");
const cloudinary = require("cloudinary");
const formidable = require("formidable");
var crypto = require("crypto");
const { dirname } = require("path");
const Order = require("./Order");
const { reverse } = require("dns/promises");
passport.use(
  new localStrategy({ usernameField: "email" }, userModel.authenticate())
);

var instance = new Razorpay({
  key_id: "rzp_test_BkPWeFB0YcGvWJ",
  key_secret: "TNkLevqWrFFS2YXrf4kACVnq",
});
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

router.post("/register", async (req, res) => {
 try {
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
 } catch (err) {
  console.log(err)
 }
});
router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
router.get("/", async (req, res, next) => {
try {
  const user = req.user;
  const product = await prdctModel.find({}).sort({_id:-1}).limit(6)
  console.log(product)
  res.render("index",{product,user});
} catch (err) {
  console.log(err)
}
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
  try {
    const product = await prdctModel.findOne({ _id: req.params.id }).populate({
      path: "prdctReview",
      populate: {
        path: "commentOwner",
      },
    });
  
    let related = await prdctModel.find({ prdctCtrg: product.prdctCtrg });
  
    function getMultipleRandom(arr, num) {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
  
      return shuffled.slice(0, num);
    }
    related = getMultipleRandom(related, 6);
    if (req.user) {
      var user = await userModel
        .findOne({ email: req.user.email })
        .populate("cart");
    } else {
      var user = null;
    }
  
    res.render("product", { product, user, related });
  } catch (error) {
    console.log(error)
  }
});
router.post("/comment/:id", async (req, res, next) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
  const product = await prdctModel.findOne({ _id: req.params.id });
  const comment = {
    comment: req.body.comment,
    commentOwner: user._id,
  };
  product.prdctReview = [...product.prdctReview, comment];
  await product.save();
  console.log(user);
  res.redirect(`back`);
  } catch (error) {
    console.log(error)
  }
});

router.post("/admin/productUpload", async (req, res, next) => {
  try {
    const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    const {
      prdctCtrg,
      prdctName,
      prdctFeatures,
      prdctDesc,
      prdctPrice,
      size,
      // prdctVideo,
    } = fields;
    // const { secure_url } = await cloudinary.v2.uploader.upload(
    //   files.thumbnail.filepath,
    //   { folder: `product/${prdctName}`, fetch_format: "webp", quality: "30" }
    // );
    let sizes = (size.length>1 )?size.map((e)=>(e.toUpperCase())): size.toUpperCase()
    console.log(size)
    // const thumbnail = secure_url;
    var allImg = [];
    let newPrctName = prdctName.split(" ")[0]
    console.log(newPrctName)
    for (let i = 0; i < files.prdctImg.length; i++) {
      try {
        
        const { secure_url , public_id } = await cloudinary.v2.uploader.upload(
          files.prdctImg[i].filepath,
          { folder: `product/${newPrctName}`, fetch_format: "webp", quality: "30" }
        );
        allImg.push({secure_url , public_id});
      } catch (error) {
          console.log(error)
      }
      try {
        await prdctModel.create({
          prdctCtrg,
          prdctName,
          prdctFeatures,
          prdctDesc,
          prdctPrice,
          sizes,
          // prdctVideo,
          // thumbnail: thumbnail,
          prdctImg: allImg,
        });
      } catch (error) {
        console.log(error);
      }
    }
      res.redirect("/store");
      // res.status(200).json(newProduct);
    });

  
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
});

router.get("/cart", isLoggedIn, async (req, res, next) => {
  try {
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
  } catch (error) {
    console.log(error)
  }
});
router.get("/checkout", isLoggedIn, async (req, res, next) => {
  try {
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
  } catch (error) {
    console.log(error)
  }
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
router.get("/story/:ctrg", async (req, res, next) => {
 try {
  let allProduct = null;
  if (req.params.ctrg == "all") {
    allProduct = await prdctModel.find();
  } else {
    allProduct = await prdctModel.find({
      $or: [
        { prdctCtrg: { $regex: req.params.ctrg, $options: "i" } },
        { prdctName: { $regex: req.params.ctrg, $options: "i" } },
        { prdctDesc: { $regex: req.params.ctrg, $options: "i" } },
        { prdctFeatures: { $regex: req.params.ctrg, $options: "i" } },
        { prdctPrice: { $regex: req.params.ctrg, $options: "i" } },
      ],
    });
  }
  if (req.user) {
    var user = await userModel
      .findOne({ email: req.user.email })
      .populate("cart");
  } else {
    var user = null;
  }
  res.status(200).json({ user, allProduct });
 } catch (err) {
  console.log(err)
 }
});
router.get("/admin", (req, res, next) => {
  res.render("admin");
});
router.get("/about", (req, res, next) => {
  res.render("about");
});
router.get("/loggedinUser", isLoggedIn, async (req, res, next) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
  res.json(user);
  } catch (err) {
    console.log(err)
  }
});
router.get("/wishlist", isLoggedIn, async (req, res, next) => {
  try {
    const user = await userModel
    .findOne({ email: req.user.email })
    .populate("wishlist");
  res.render("wishlist", { user });
  } catch (err) {
    console.log(err)
  }
});
router.get("/wishlist/remove/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user = await userModel
    .findOne({ email: req.user.email })
    .populate("wishlist");
  user.wishlist.splice(user.wishlist.indexOf(req.params.id), 1);
  await user.save();
  res.redirect("back");
  } catch (err) {
    console.log(err)
  }
});
router.get("/profile", isLoggedIn, async (req, res, next) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });

  res.render("profile", { user });
  } catch (err) {
    console.log(err)
  }
});
router.get("/addToWish/:id", isLoggedIn, async (req, res, next) => {
 try {
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
 } catch (err) {
  console.log(err)
 }
});
router.post("/addToCart/:id", isLoggedIn, async (req, res, next) => {
  try {
    const product = await prdctModel.findOne({ _id: req.params.id });
  const user = await userModel.findOne({ email: req.user.email }).populate({
    path: "cart",
    populate: {
      path: "product",
    },
  });

  const search = (item) => {
    return (
      item.product._id.toString() == product._id.toString() &&
      item.size == req.body.size
    );
  };
  const productIndex = user.cart.findIndex(search);

  console.log(productIndex);
  if (productIndex == -1) {
    const cart = {
      size: req.body.size,
      quantity: req.body.quantity,
      Amt: req.body.price,
      product: product._id,
    };
    user.cart.push(cart);
    await user.save();
  } else {
    try {
      user.cart[productIndex].quantity += 1;
      await user.save();
    } catch (err) {
      console.log(user);
      res.status(400).json(err);
    }
  }
  res.redirect("back");
  } catch (err) {
    console.log(err)
  }
});

router.get("/cart/delete/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).populate({
      path: "cart",
      populate: {
        path: "product",
      },
    });
    const search = (item) => {
      return (item._id = req.params.id);
    };
    const productIndex = user.cart.findIndex(search);
  
    user.cart.splice(user.cart[productIndex], 1);
    await user.save();
    res.redirect("back");
  } catch (err) {
    console.log(err)
  }
});

router.get("/cart/inc/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).populate({
      path: "cart",
      populate: {
        path: "product",
      },
    });
    const search = (item) => {
      return item._id == req.params.id;
    };
    const productIndex = user.cart.findIndex(search);
  
    user.cart[productIndex].quantity += 1;
    await user.save();
    res.redirect("back");
  } catch (err) {
    console.log(err)
  }
});
router.get("/cart/dec/:id", isLoggedIn, async (req, res, next) => {
  try {
    const user = await userModel.findOne({ email: req.user.email }).populate({
      path: "cart",
      populate: {
        path: "product",
      },
    });
    const search = (item) => {
      return item._id == req.params.id;
    };
    const productIndex = user.cart.findIndex(search);
  
    if (user.cart[productIndex].quantity > 1) {
      user.cart[productIndex].quantity -= 1;
    }
    await user.save();
    res.redirect("back");
  } catch (err) {
    console.log(err)
  }
});

router.get(
  "/removecomment/:product/:comment",
  isLoggedIn,
  async (req, res, next) => {
    try {
      const product = await prdctModel.findOne({ _id: req.params.product });

    product.prdctReview.splice(
      product.prdctReview.indexOf(req.params.comment),
      1
    );
    await product.save();
    res.redirect("back");
    } catch (err) {
      console.log(err)
    }
  }
);

router.post("/update", isLoggedIn, async (req, res, next) => {
  try {
    const { email, pfp, name, gender, number, altNumber, dob } = req.body;

  await userModel.findOneAndUpdate(
    { email: req.user.email },
    {
      email: email,
      name: name,
      gender: gender,
      number: number,
      altNumber: altNumber,
      dob: dob,
    }
  );

  res.redirect("back");
  } catch (err) {
    console.log(err)
  }
});
router.post("/addressAdd", isLoggedIn, async (req, res, next) => {
  try {
    const { location, pincode, city, state } = req.body;
  const address = {
    id: uuidv4(),
    location: location,
    pincode: pincode,
    city: city,
    state: state,
  };

  const user = await userModel.findOne({ email: req.user.email });
  user.address.push(address);
  await user.save();
  res.redirect("back");
  } catch (err) {
    console.log(err)
  }
});
router.post("/changepfp", isLoggedIn, async (req, res, next) => {
 try {
  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    const user = await userModel.findOne({ email: req.user.email });
    console.log(files);
    console.log(err);
    if (user.pfp.public_id === "default/Avatar_tictb7.png") {
    } else {
      const imageId = user.pfp.public_id;
      await cloudinary.v2.uploader.destroy(imageId);
    }
    const { public_id, secure_url } = await cloudinary.v2.uploader.upload(
      files.pfp.filepath,
      {
        folder: `user/${user.email}`,
        fetch_format: "webp",
        quality: "50",
      }
    );
    user.pfp = { public_id, url: secure_url };
    await user.save();
    res.redirect("back");
  });
 } catch (err) {
  console.log(err)
 }
});
router.get("/forgot", async (req, res, next) => {
  res.render("forgot");
});

router.get("/usernotfound", function (req, res) {
  res.render("usernotfound", { pagename: "Not Found", loggedin: false });
});
router.get("/mail", function (req, res) {
  res.render("mail");
});

router.post("/forgot", function (req, res) {
  var sec = uuidv4();
  userModel.findOne({ email: req.body.email }).then(function (founduser) {
    if (founduser !== null) {
      founduser.secret = sec;
      founduser.expiry = Date.now() + 15 * 1000;
      founduser.save().then(function () {
        var routeaddress = `http://localhost:4000/forgot/${founduser._id}/${sec}`;
        sendMail(req.body.email, routeaddress).then(function () {
          res.send("Check your email");
        });
      });
    }
  });
});

router.get("/forgot/:id/:secret", function (req, res) {
  userModel.findOne({ _id: req.params.id }).then(function (founduser) {
    if (
      founduser.secret === req.params.secret &&
      Date.now() < founduser.expiry
    ) {
      res.render("newpassword", {
        founduser,
        pagename: "New Password",
        loggedin: false,
      });
    } else {
      res.send("link expired");
    }
  });
});

router.post("/newpassword/:email", function (req, res) {
  userModel.findOne({ email: req.params.email }).then(function (founduser) {
    founduser.setPassword(req.body.password1, function () {
      founduser.save().then(function () {
        req.logIn(founduser, function () {
          res.redirect("/");
        });
      });
    });
  });
});

router.get("/thankyou", async (req, res, next) => {
  console.log(req.query);

  res.render("thankyou");
});

router.get("/alluser/:email", async (req, res, next) => {

  const user = await userModel.findOne({ email: req.params.email }).populate({
    path: "cart",
    populate: {
      path: "product",
    },
  });
  res.json(user);
  

});
router.post("/create/orderId", function (req, res, next) {
  var options = {
    amount: req.body.amount, // amount in the smallest currency unit
    currency: "INR",
    receipt:
      "order_rcptid_" +
      Math.floor(Math.random() * 1000000000000) +
      Date.now().toString(),
  };

  instance.orders.create(options, function (err, order) {
    console.log({ orderId: order });
    res.json({ orderId: order });
  });
});

router.post("/api/payment/verify", async (req, res) => {
  try {
    const {
      response: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
    } = req.body;
    let body = razorpay_order_id + "|" + razorpay_payment_id;
  
    var expectedSignature = crypto
      .createHmac("sha256", "TNkLevqWrFFS2YXrf4kACVnq")
      .update(body.toString())
      .digest("hex");
    console.log("sig >> " + expectedSignature);
  
    console.log("rzp_signature >> " + razorpay_signature);
    var response = { signatureIsValid: false };
    console.log(expectedSignature, razorpay_signature);
    if (expectedSignature === razorpay_signature) {
      response = {
        signatureIsValid: true,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      };
    }
  
    res.status(200).json(response);
  } catch (err) {
    console.log(err)
  }
});

router.post("/successOrder", async (req, res, next) => {


  const {
    razorpay_order_id,
    razorpay_payment_id,
    orderId,
    Email,
    phnNum,
    address,
    instruction,
    typy,
  } = req.body;
  // instance.invoices.create({
  //   type: "invoice",
  //   date: Date.now(),
  //   customer_id: "cust_" + req.user._id ,
  //   line_items: [
  //     {
  //       item_id: razorpay_order_id,

  //         name: "Book / A Wild Sheep Chase",
  //         amount: 200,
  //         currency: "INR",
  //         quantity: 1

  //     }
  //   ]
  // })
  console.log(req.body);
  if (typy == "COD") {
    var payment = {
      typy,
      PaymentID: "Cash On Delivery",
    };
  } else {
    var payment = {
      typy,
      PaymentID: razorpay_payment_id,
    };
  }
  var user = await userModel.findOne({ _id: req.user._id });

  let addressDets = user.address.filter((item) => item.id == address);
  console.log(orderId);
  const order = new Order({
    user: user._id,
    amount: orderId?.amount / 100,

    orderID: orderId?.id || razorpay_order_id, // If orderId comes then only proceed to execute for orderId.id
    payment,
    Email,
    phnNum,
    Address: addressDets[0],
    status: "placed",
    DeliveryInstructions: instruction,
    items: user.cart,
  });

  user.cart = [];
  try {
    await user.save();
  } catch (error) {
    console.log(error);
  }
  user.myorder.push(order._id);
  try {
    await user.save();
  } catch (error) {
    console.log(error);
  }
  try {
    var createdOrder = await order.save();
  } catch (error) {
    console.log(error);
  }

  console.log(createdOrder);
  res.status(200).json({ msg: "success", createdOrder });


});

router.get("/myorders",isLoggedIn, async (req, res, next) => {

  let order = await userModel.findOne({ _id:req.user._id }).populate({
    path: "myorder",
    populate: {
      path: "items.product",
    },
  })
  // console.log(order.myorder[0].items[0].product.prdctName )

  res.render("myorders", { Myorder: order.myorder });
});
router.get("/custom", async (req, res, next) => {
  res.render("custom");
});
router.post("/admin/updateNaming", async (req, res, next) => {
  const { id, name, price, desc, sizes } = req.body;
  sizy = sizes.map((item) => item.toUpperCase().trim());
  try {
    const product = await prdctModel.findOne({ _id: id });
    product.prdctName = name;
    product.prdctPrice = price;
    product.prdctDesc = desc;
    product.sizes = sizy;
    await product.save();
  } catch (error) {
    console.log(error);
  }

  res.redirect("back");
});
router.post("/admin/updateFeature", async (req, res, next) => {
  const { prdctFeatures, id } = req.body;

  try {
    const product = await prdctModel.findOne({ _id: id });

    product.prdctFeatures = prdctFeatures;
    await product.save();
  } catch (error) {
    console.log(error);
  }

  res.redirect("back");
});
router.get("/admin/allProduct", async (req, res, next) => {
  let order = await Order.find().sort({ _id: -1 });
  console.log(order);
  res.render("allOrders", { order });
});
router.get("/admin/allUsers", async (req, res, next) => {
  let users = await userModel.find().sort({ _id: -1 });
  console.log(users);
  res.render("AllUsers", { users });
});

router.get("/renderSearchPage/", (req, res) => {
  res.render("searchItems", { searchValue: req.query.searchValue });
});

router.get("*", async (req, res, next) => {
  res.render("error");
});

module.exports = router;
