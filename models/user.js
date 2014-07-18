var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/WishList' , function(err){
    if(err)
        console.log(err);
    else
        console.log("DB Starts!");
});
var autoinc = require('mongoose-id-autoinc');

autoinc.init(db);

var userSchema = new mongoose.Schema({
    userID: Number,
    password: {
        type: String,
        required: true
    },
    meta: {
        email: {
            type: String,
            required: true,
            unique: true
        },
        nickname: {
            type: String,
            required: true
        },
        realname: {
            type: String,
            default: ''
        },
        avatar: {
            type: String,
            default: ''
        },
        birthday: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            default: ''
        },
        favtag: [Number]
    },
    follow: [Number],
    ownwish: [Number],
    orderwish: [Number]
});

userSchema.plugin(autoinc.plugin, {
    model: 'User',
    field: 'userID'
});

var User = mongoose.model('User', userSchema);

module.exports = User;
