var env = process.env.NODE_ENV || 'production',
    config = require('../config')[env];

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    OAuth = require('oauth'),
    passport = require('passport'),
    FitbitStrategy = require('passport-fitbit').Strategy;

// Configure Passport session management to use the Fitbit user.
// These de/serialise functions work for this hack but are not
// well suited for "real world" apps because you'd want to persist
// the user's session across multiple Node instances and app reboots
passport.serializeUser(function (user, done) {
    // console.log("serialise user", user);
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    // console.log("deserialise obj", obj);
    done(null, obj);
});

// Tell Passport to use the Fitbit Strategy
passport.use(new FitbitStrategy({
        consumerKey: config.fitbitClientKey,
        consumerSecret: config.fitbitClientSecret,
        callbackURL: "http://" + config.host + "/auth/fitbit/callback"
    },
    function (token, tokenSecret, profile, done) {
        // Store the user credentials
        User.update(
            { encodedId: profile.id },
            {
                encodedId: profile.id,
                accessToken: token,
                accessSecret: tokenSecret,
                avatar: profile._json.user.avatar,
                avatar150: profile._json.user.avatar150,
                country: profile._json.user.country,
                dateOfBirth: profile._json.user.dateOfBirth,
                displayName: profile._json.user.displayName,
                fullName: profile._json.user.fullName,
                gender: profile._json.user.gender,
                height: profile._json.user.height,
                heightUnit: profile._json.user.heightUnit,
                memberSince: profile._json.user.memberSince,
                timezoneOffset: profile._json.user.offsetFromUTCMillis,
                timezone: profile._json.user.timezone,
                startDayOfWeek: profile._json.user.startDayOfWeek,
                strideLengthRunning: profile._json.user.strideLengthRunning,
                strideLengthWalking: profile._json.user.strideLengthWalking,
                weight: profile._json.user.weight,
                weightUnit: profile._json.user.weightUnit
            },
            { upsert: true },
            function (err, numberAffected) {
                if (err) console.error(err);
                console.log('User updated ' + numberAffected + ' records.');
            }
        );

        return done(null, profile);
    }
));