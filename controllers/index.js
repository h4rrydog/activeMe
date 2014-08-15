var env = process.env.NODE_ENV || 'production',
    config = require('../config')[env];

var mongoose = require('mongoose'),
    User = mongoose.model('User');

// Index page that asks the user to sign in with Fitbit
module.exports.index = function (req, res) {
    res.render('index');
};

// Page where user profile is shown
module.exports.showUser = function (req, res) {
    // Retrieve the user's information from the session
    if (req.isAuthenticated()) {
        User.find().where('encodedId').equals(req.session.passport.user.id).findOne(
            function (err, user) {
                if (err) {
                    res.send(500);
                    return;
                }

                // Pass the user's info to the template
                res.render('account', { user: req.user });
            }
        );
    }
    else {
        res.redirect('/');
    }
};

// Page where user profile is refreshed from Fitbit
module.exports.refreshUser = function (req, res) {
    // TODO
};