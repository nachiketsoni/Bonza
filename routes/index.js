var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
<<<<<<< HEAD
router.get('/product', function(req, res, next) {
  res.render('product');
=======
router.get('/login', function(req, res, next) {
  res.render('login');
>>>>>>> 0ae46353bba2a8115abf282959cf0ff5e1330a07
});

module.exports = router;
