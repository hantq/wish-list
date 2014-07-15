var settings = require('../settings');
var mongoose = require('mongoose');
var db = mongoose.createConnection(settings.host, settings.db);
var autoinc = require('mongoose-id-autoinc');

autoinc.init(db, userCounter);

var userSchema = new mongoose.Schema({
    userID: Number,
    password: {
        type: String,
        required: true,
        set: Data.prototype.md5
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
        realname: String,
        birthday: Date,
        address: String,
        favcat: [Number],
        avatar: String
    },
    follow: [Number],
    ownwish: [Number],
    orderwish: [Number]
});

var User = mongoose.model('User', userSchema);

userSchema.plugin(autoinc.plugin, {
	model: 'User',
	field: 'userID'
});

module.exports = User;
