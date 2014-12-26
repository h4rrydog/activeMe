var env = process.env.NODE_ENV || 'production',
    config = require('../config')[env];

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Steps = mongoose.model('Steps');

var moment = require('moment');

var async = require('async');

// Module exports
// List users in the database
module.exports.listUsers = function (req, res) {
    async.waterfall([
        usersQuery,
        stepsQuery
    ],
    function (err, results) {
        if (err) {
            console.error(err);
        }

        res.render('users', {
            users: results
        });
    });
};

module.exports.refreshUsers = function (req, res) {

};

// Helper functions
function usersQuery(callback) {
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
            else {
                callback(null, userList);
            }
        });
}

function stepsQuery(userList, callback) {
    // For each user, get the last 7 days of step data
    // and add it to output data array.
    var stepArray,
        userId,
        numberOfUsers = userList.length,
        dateStart = moment().subtract(14, 'days').calendar();

    for (var i = 0; i < numberOfUsers; i += 1) {
        userId = userList[i].encodedId;

        Steps
            .find({encodedId: userId, dateTime: {$gt: dateStart}})
            .sort('dateTime')
            .exec(function (err, activityList) {
                if (err) {
                    console.error("Error finding activity for user: ", userId, err);
                    callback(err);
                    return;
                }
                else {
                    stepArray.push(activityList);
                }
            });

    }

    callback(null, userList);
}