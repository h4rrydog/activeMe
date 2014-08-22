// ActiveMe - main node.js app.
// Fitbit API consumer, analytics and dashboard.
// By Ifung Lu
// 13 August 2014

var env = process.env.NODE_ENV || 'production',
    config = require('./config')[env];

var express = require('express'),
    exphbs = require('express-handlebars'),
    path = require('path'),
    favicon = require('serve-favicon'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    serveStatic = require('serve-static');

var OAuth = require('oauth'),
    passport = require('passport'),
    mongoose = require('mongoose');

var app = express();

// Configure Express
app.set('port', process.env.PORT || 3000);
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(morgan('combined'));
app.use(cookieParser('TODO Random string: Hases are awesome!'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(session({
    secret: 'TODO Random string: Hases are awesome!',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect to database and initialise model
mongoose.connect(config.db);
require('./models/user');
require('./models/steps');

// Initialise controllers
var IndexController = require('./controllers/index'),
    // DashboardController = require('./controllers/dashboard'),
    AnalyticsController = require('./controllers/analytics'),
    FitbitAuthController = require('./controllers/fitbit-auth'),
    FitbitApiController = require('./controllers/fitbit-api');

// Define routes
// Index and refresh routes
app.get('/', IndexController.index);
app.get('/account', IndexController.showUser);
app.get('/users', AnalyticsController.listUsers);
// app.get('/users-refresh', AnalyticsController.refreshUsers);
app.get('/api-getTimeSeries', FitbitApiController.getTimeSeries);

// OAuth routes
app.get('/auth/fitbit', passport.authenticate('fitbit'));
app.get('/auth/fitbit/callback',
    passport.authenticate('fitbit', { failureRedirect: '/?error=auth_failed' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/account');
    }
);

// Otherwise use static
app.use(serveStatic(path.join(__dirname + '/public')));

// Start the server
app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
