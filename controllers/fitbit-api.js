var env = process.env.NODE_ENV || 'production',
    config = require('../config')[env];

var moment = require('moment'),
    OAuth = require('oauth'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');
    Steps = mongoose.model('Steps');

var oauth = new OAuth.OAuth(
    'https://api.fitbit.com/oauth/request_token',
    'https://api.fitbit.com/oauth/access_token',
    config.fitbitClientKey,
    config.fitbitClientSecret,
    '1.0',
    null,
    'HMAC-SHA1'
);

module.exports.getTimeSeries = function (req, res) {
    // Initially try just one account (me)
    // TODO - Iterate through the list of users and get updates
    updateUserSteps('27KSGW', nullCallback);

    User.find(
        {},
        {"encodedId": true},
        function (err, userList) {
            var i,
                size = userList.length;

            for (i = 0; i < size; i += 1) {
                updateUserSteps(userList[i].encodedId, nullCallback);
            }
        }
    );
};

function updateUserSteps(encodedId, callback) {
    console.log("Trying to update steps for", encodedId, "...");

    User.findOne(
        {
            'encodedId': encodedId
        },
        function (err, user) {
            if (err) {
                console.error("Error finding user", err);
                callback(err);
                return;
            }

            // Get step time series from Fitbit API
            oauth.get(
                'https://api.fitbit.com/1/user/-/activities/steps/date/today/max.json',
                user.accessToken,
                user.accessSecret,
                function (err, data, res) {
                    if (err) {
                        console.error("Error fetching activity data. ", err);
                        callback(err);
                        return;
                    }

                    data = JSON.parse(data);
                    console.log("Getting steps from Fitbit ...");

                    // Update steps
                    var i,
                        stepsArray = data['activities-steps'];
                        size = stepsArray.length;

                    console.log("Upserting", size, "records for user", encodedId, "...");

                    for (i = 0; i < size; i += 1) {
                        Steps.findOneAndUpdate(
                            {
                                encodedId: user.encodedId,
                                dateTime: moment(stepsArray[i].dateTime, "YYYY-MM-DD")
                            },
                            {
                                stepsDaily: stepsArray[i].value
                            },
                            {
                                upsert: true
                            },
                            function(err, steps) {
                                if (err) {
                                    console.error("Error updating steps.", err);
                                }
                                callback(err, steps);
                            }
                        );
                    }
                }
            );
        }
    );
}

function nullCallback(err, steps) {
    // nothing happens
}
