var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/product', function(req, res, next) {
  res.render('product');
})
router.get('/cart', function(req, res, next) {
  res.render('cart');
})
router.get('/store', function(req, res, next) {
  res.render('store');
})
router.get('/checkout', function(req, res, next) {
  res.render('checkout');
})
router.get('/login', function(req, res, next) {
  res.render('login');
});

module.exports = router;
