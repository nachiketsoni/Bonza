require("dotenv").config({ path: "./config/.env" });
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')
//AdminJs
const AdminJS = require('adminjs')
const AdminJSExpress = require('@adminjs/express')
const AdminJSMongoose = require("@adminjs/mongoose");

const userResource = require('./routes/users')
const productResource = require('./routes/product')
const couponResource = require('./routes/coupon')
const paymentResource = require('./routes/payment')


AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
})

// //port
const PORT = 3000

const startAdminJS = async () => {
  const app = express();

  const mongooseDB = mongoose.createConnection(process.env.MONGODB_URL);
  mongooseDB.on(`error`, console.error.bind(console, `connection error:`));
  mongooseDB.once(`open`, function () {
    // we`re connected!
    // console.log(`MongoDB connected on "  ${process.env.MONGODB_URL}`);
    console.log(`MongoDB connected on ${process.env.MONGODB_URL}}`);
  });

  // const BookResourceOptions = {
  //   databases: [mongooseDB],
  //   resources: [userResource,productResource , couponResource , paymentResource],
  // };

  // const adminOptions = {
  //   rootPath: "/admin",
  //   resources: [BookResourceOptions],
  // };

  const adminJs = new AdminJS({
    resources: [
      {
        resource: userResource,
      },
      {
        resource: productResource,
      },
      {
        resource: couponResource,
      },
      {
        resource: paymentResource,
      }
    ],
    rootPath: '/admin'
  })

  const adminRouter = AdminJSExpress.buildRouter(adminJs)
  app.use(adminJs.options.rootPath, adminRouter)

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}, AdminJS server started on URL: http://localhost:${PORT}${adminJs.options.rootPath}`)
  })
}
startAdminJS()

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const passport = require('passport')
const expressSession = require('express-session');
const { Cookie } = require('express-session');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET,
  // cookie: {maxAge: 1000 * 60 * 60 * 24 * 7}
}))
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, done) { done(null, user); });
passport.deserializeUser(function (user, done) { done(null, user); });


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
})

module.exports = app;
