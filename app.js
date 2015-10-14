var express = require('express');
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require('express-session');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var GitHubStrategy = require('passport-github').Strategy;

var User = require('./models/user');

var mongoose = require('mongoose');

var routes = require('./routes');

var GITHUB_CLIENT_ID = process.env.GITHUB_ID || 'da50ef5b007bb81068bc';
var GITHUB_CLIENT_SECRET = process.env.GITHUB_SECRET || '780d69bc3ec6c76faccef27a4c114e87a8017e1c';

var TWITTER_consumerKey = process.env.TWITTER_KEY || 'lkVvgvuFyPDyMa7ARYVuF7cjR';
var TWITTER_consumerSecret = process.env.TWITTER_SECRET || 'zBstuMr9fol2axy3uXmNeDKMh4y3LEb2PX8AjOHzzriaUkqWDf';

mongoose.connect('mongodb://localhost/oauth', function () {
    console.log('mongodb connected');
});

var app = express();

app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/login/github/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({ 'github.id': profile.id }, function(err, existingUser) {
            if (existingUser) {
                return done(null, existingUser);
            } 
            var user = new User();
            user.github.id = profile.id;
            user.github.token = accessToken;
            user.email = profile.username + '@github.' + '.com';
            user.save(function(err) {
                done(err, user);
            });
        });
    }
));

passport.use(new TwitterStrategy({
    consumerKey: TWITTER_consumerKey,
    consumerSecret: TWITTER_consumerSecret,
    callbackURL: 'http://localhost:3000/login/twitter/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOne({ 'twitter.id': profile.id }, function(err, existingUser) {
            if (existingUser) {
                return done(null, existingUser);
            } 
            var user = new User();
            user.twitter.id = profile.id;
            user.twitter.token = accessToken;
            user.email = profile.username + '@twitter.' + '.com';
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

app.listen(3000);