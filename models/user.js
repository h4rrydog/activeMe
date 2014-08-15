var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'production',
    config = require('../config')[env],
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    encodedId: {type: String, required: true, index: true, unique: true},
    accessToken: {type: String, required: true},
    accessSecret: {type: String, require: true},
    lastSync: Date,
    stepsToday: Number,
    stepsGoal: Number,
    avatar: String,
    avatar150: String,
    country: String,
    dateOfBirth: Date,
    displayName: String,
    fullName: String,
    gender: String,
    height: Number,
    heightUnit: String,
    memberSince: Date,
    timezoneOffset: Number,
    timezone: String,
    startDayOfWeek: String,
    strideLengthRunning: Number,
    strideLengthWalking: Number,
    weight: Number,
    weightUnit: String
});

var User = mongoose.model('User', UserSchema);