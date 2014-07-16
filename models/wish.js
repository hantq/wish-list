var settings = require('../settings');
var mongoose = require('mongoose');
var db = mongoose.createConnection(settings.host, settings.db);
var autoinc = require('mongoose-id-autoinc');

autoinc.init(db, wishCounter);

var wishSchema = new mongoose.Schema({
    wishID: Number,
    owner: Number,
    meta: {
        name: {
            type: String,
            required: true
        },
        pic: String,
        addeddate: {
            type: Date,
            default: Date.now()
        },
        completedate: Date,
        deadline: Date,
        location: String,
        priority:{
            type: Number,
            default: 0  // 0 normal, 1 important
        },
        tag: [Number]
    },
    authority: {
        type: Number,
        default: 0  // 0 for all, 1 for follow, 2 for private
    },
    ordered: {
        type: Number,
        default: 0
    },
    completed: {
        type: Boolean,
        default: false
    }
});

var Wish = mongoose.model('Wish', wishSchema);

wishSchema.plugin(autoinc.plugin, {
    model: 'Wish',
    field: 'wishID'
});

module.exports = Wish;
