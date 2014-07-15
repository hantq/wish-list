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
        deadline: Date,
        location: String,
        priority:{
            type: Number,
            default: 1
        },
        cat: [Number]
    },
    authority: {
        type: Number,
        default: 1
    },
    ordered: Number,
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
