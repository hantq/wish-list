var mongoose = require('mongoose');
var autoinc = require('mongoose-id-autoinc');

var wishSchema = new mongoose.Schema({
    wishID: Number,
    owner: Number,
    meta: {
        name: {
            type: String,
            required: true
        },
        describe: {
            type: String,
            default: ''
        },
        pic: {
            type: String,
            default: ''
        },
        addeddate: {
            type: String,
            default: new Date().toISOString().slice(0,10)
        },
        completedate: {
            type: String,
            default: ''
        },
        deadline: {
            type: String,
            default: ''
        },
        link: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
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

wishSchema.plugin(autoinc.plugin, {
    model: 'Wish',
    field: 'wishID'
});

var Wish = mongoose.model('Wish', wishSchema);

module.exports = Wish;
