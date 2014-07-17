var mongoose = require('mongoose');
/*var db = mongoose.connect('mongodb://localhost/WishList' , function(err){
    if(err)
        console.log(err);
    else
        console.log("DB Starts!");
});*/
var autoinc = require('mongoose-id-autoinc');

//autoinc.init(db);

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
            default: ''
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
        tag: [String]
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
