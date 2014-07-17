var mongoose = require('mongoose');
/*var db = mongoose.connect('mongodb://localhost/WishList' , function(err){
    if(err)
        console.log(err);
    else
        console.log("DB Starts!");
});*/
var autoinc = require('mongoose-id-autoinc');

//autoinc.init(db);

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
