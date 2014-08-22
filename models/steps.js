var mongoose = require('mongoose'),
    env = process.env.NODE_ENV || 'production',
    config = require('../config')[env],
    Schema = mongoose.Schema;

var StepsSchema = new Schema({
    encodedId: {type: String, required: true, index: true},
    dateTime: {type: Date, required: true, index: true},
    stepsDaily: Number,
    }
);

var Steps = mongoose.model('Steps', StepsSchema);