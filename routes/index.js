var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'log' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'LogIN' });
});

router.get('/account', function(req, res, next) {
  res.render('account', { title: 'Account' });
});

router.get('/login/github', passport.authenticate('github', { scope: 'email' }));

router.get('/login/github/callback', passport.authenticate('github', 
    { successRedirect: '/account', failureRedirect: '/login' }));

router.get('/login/twitter', passport.authenticate('twitter', { scope: 'email' }));

router.get('/login/twitter/callback', passport.authenticate('twitter', 
    { successRedirect: '/account', failureRedirect: '/login' }));

module.exports = router;
