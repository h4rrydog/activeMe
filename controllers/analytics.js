var env = process.env.NODE_ENV || 'production',
    config = require('../config')[env];

var mongoose = require('mongoose'),
    User = mongoose.model('User');

// List users in the database
module.exports.listUsers = function (req, res) {
    User
        .find({})
        .select('displayName encodedId avatar')
        .sort('displayName')
        .exec(function (err, userList) {
            if (err) {
                console.error("Error finding users for users page: ", err);
                callback(err);
                return;
            }

            // Render users page
            res.render('users', { users: userList });
        }
    );
};
