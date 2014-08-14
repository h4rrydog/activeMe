// ActiveMe
// Fitbit API consumer, analytics and dashboard.
// By Ifung Lu
// 13 August 2014

var env = process.env.NODE_ENV || 'production',
    config = require('./config')[env];

var express = require('express'),
    exphbs = require('express-handlebars'),
    util = require('util'),
    passport = require('passport'),
    FitbitStrategy = require('passport-fitbit').Strategy,
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    serveStatic = require('serve-static'),
    MongoClient = require('mongodb').MongoClient;

// MongoDB server connection wrapper
MongoClient.connect('mongodb://localhost:27017/ActiveMe', function (err, db) {
    "use strict";

    if (err) throw err;
    console.log("ActiveMe connected to mongod on 27017...");


    // Passport session setup.
    // To support persistent login sessions, Passport needs to be able to
    // serialize users into and deserialize users out of the session.  Typically,
    // this will be as simple as storing the user ID when serializing, and finding
    // the user by ID when deserializing.  However, since this example does not
    // have a database of user records, the complete Fitbit profile is serialized
    // and deserialized.
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });


    // Use the FitbitStrategy within Passport.
    // Strategies in passport require a `verify` function, which accept
    // credentials (in this case, a token, tokenSecret, and Fitbit profile), and
    // invoke a callback with a user object.
    passport.use(new FitbitStrategy({
        consumerKey: config.fitbitConsumerKey,
        consumerSecret: config.fitbitConsumerSecret,
        callbackURL: "http://127.0.0.1:3000/auth/fitbit/callback"
        },
        function(token, tokenSecret, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(function () {

            // To keep the example simple, the user's Fitbit profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Fitbit account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
            });
        }
    ));


    var app = express();

    // configure Express
    app.engine('handlebars', exphbs({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');
    app.use(morgan('combined'));
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(methodOverride());
    app.use(session({
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: true
    }));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());


    // Routes
    app.get('/', function(req, res){
        res.render('index', { user: req.user });
    });

    app.get('/account', ensureAuthenticated, function(req, res){
        res.render('account', { user: req.user });
        console.log(req.user);
    });

    app.get('/login', function(req, res){
        res.render('login', { user: req.user });
    });

    app.get('/steps', getSteps, function(req, res) {
        res.render('steps', {});
    });

    // GET /auth/fitbit
    // Use passport.authenticate() as route middleware to authenticate the
    // request.  The first step in Fitbit authentication will involve redirecting
    // the user to fitbit.com.  After authorization, Fitbit will redirect the user
    // back to this application at /auth/fitbit/callback
    app.get('/auth/fitbit',
        passport.authenticate('fitbit'),
        function(req, res){
            // The request will be redirected to Fitbit for authentication, so this
            // function will not be called.
    });

    // GET /auth/fitbit/callback
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.get('/auth/fitbit/callback',
        passport.authenticate('fitbit', { failureRedirect: '/login' }),
        function(req, res) {
            res.redirect('/account');
    });

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });

    // Otherwise use static
    app.use(serveStatic(__dirname + '/public'));

    app.listen(3000);
    console.log("ActiveMe listening on port 3000...");


    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) { return next(); }
        res.redirect('/login');
    }

    // Get steps using Fitbit API
    function getSteps(req, res, next) {
        if (req.isAuthenticated()) {

        }
    }

});