var settings = require('../settings');
var mongoose = require('mongoose');
var db = mongoose.createConnection(settings.host, settings.db);
var autoinc = require('mongoose-id-autoinc');

autoinc.init(db, catCounter);

var catSchema = new mongoose.Schema({
    catID: Number,
    name: String
});

var Cat = mongoose.model('Cat', catSchema);

catSchema.plugin(autoinc.plugin, {
    model: 'Cat',
    field: 'catID'
});

module.exports = Cat;
