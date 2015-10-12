var express = require('express');
var session = require('express-session');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var GitHubStrategy = require('passport-github').Strategy;

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/oauth', function () {
    console.log('mongodb connected')
});

var User = require('./models/user');

var routes = require('./routes');

var GITHUB_CLIENT_ID = 'da50ef5b007bb81068bc';
var GITHUB_CLIENT_SECRET = '780d69bc3ec6c76faccef27a4c114e87a8017e1c';

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: 'http://127.0.0.1:3000/auth/github/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({ twitter: profile.id }, function(err, existingUser) {
            if (existingUser) {
                return done(null, existingUser);
            } 
            var user = new User();
            // Twitter will not provide an email address. Period.
            // But a person's twitter username is guaranteed to be unique
            // so we can "fake" a twitter email address as follows:
            // username@twitter.mydomain.com
            user.email = profile.username + '@twitter.' + 'domain' + '.com';
            user.twitter = profile.id;
            user.save(function(err) {
                done(err, user);
            });
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

var app = express();

app.set('view engine', 'jade');

app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/account', ensureAuthenticated, function(req, res) {
    res.render('account');
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback', passport.authenticate('github', 
    { successRedirect: '/account', failureRedirect: '/login' }));

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.listen(3000);