var settings = require('../settings');
var mongoose = require('mongoose');
var db = mongoose.createConnection(settings.host, settings.db);
var autoinc = require('mongoose-id-autoinc');

autoinc.init(db);

var tagSchema = new mongoose.Schema({
    tagID: Number,
    name: String
});

var Tag = mongoose.model('Tag', tagSchema);

tagSchema.plugin(autoinc.plugin, {
    model: 'Tag',
    field: 'tagID'
});

module.exports = Tag;
