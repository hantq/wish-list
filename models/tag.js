var mongoose = require('mongoose');
var autoinc = require('mongoose-id-autoinc');

var tagSchema = new mongoose.Schema({
    tagID: Number,
    name: String
});

tagSchema.plugin(autoinc.plugin, {
    model: 'Tag',
    field: 'tagID'
});

var Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
