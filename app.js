var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var async = require('async');
var User = require('models/user');
var Wish = require('models/wish');
var Cat = require('models/cat');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
	secret: settings.cookieSecret,
	key: settings.db,
	cookie: {
		maxAge: 1000*60*60*24*30
	},
	store: new MongoStore({
		db: settings.db
	})
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// test
app.get('/api', function(req, res) {
	res.send('API is running.');
});

// get a wish
app.get('/api/wish/:id', function(req, res) {
	Wish.findOne({wishID: req.params.id}, function(err, wish) {
        if(err)
            res.send(err);
        console.log(wish);
        res.json(wish);
	});
});

// get an user
app.get('/api/user/:id', function(req, res) {
    User.findOne({userID: req.params.id}, function(err, user) {
		if(err)
            res.send(err);
        console.log(user);
        res.json(user);
	});
});

// get own wishes from an user
app.get('/api/user/:id/ownwish', function(req, res){
    User.findOne({userID: req.params.id}, function(err, user){
        if(err)
            res.send(err);
        Wish.find({wishID: {$in: user.ownwish}}, function(err, wishes){
            if(err)
                res.send(err);
            res.json(wishes);
        });
    });
});

// get order wishes from an user
app.get('/api/user/:id/orderwish', function(req, res) {
    User.findOne({userID: req.params.id}, function(err, user){
        if(err)
            res.send(err);
        Wish.find({wishID: {$in: user.orderwish}}, function(err, wishes) {
            if(err)
                res.send(err);
            res.json(wishes);
        });
    });
});

// create an user
app.post('/api/user', function(req, res){
    var newUser = new User(req.body);
    newUser.save(function (err) {
        if(err)
            res.send(err);
    });
    res.json(newUser);
});

// create an wish
app.post('/api/wish', function(req, res){
    var newWish = new Wish(req.body);
    newWish.save(function (err) {
        if(err)
            res.send(err);
    });
    res.json(newWish);
});

// update an user
app.put('/api/user/:id', function(req, res){
    User.findOneAndUpdate({userID: req.params.id}, {$set: {
		password: 
	}});
});

// update a wish
app.put('/api/wish/:id', function(req, res) {
});

// delete a user
app.delete('/api/user/:id', function(req, res){
    User.remove({userID: req.params.id}, function(err) {
        if(err)
            res.send(err);
        res.json(true);
    });
});

// delete an wish
app.delete('/api/wish/:id', function(req, res){
    Wish.remove({wishID: req.params.id}, function(err) {
        if(err)
            res.send(err);
        res.json(true);
    });
});

// return 10 random wishes
app.get('/api/wish', function(req, res){
    Wish.find(function(err, wishes){
        if(err)
            res.send(err);

    });
});

// return all users
app.get('/api/user', function(req, res) {
    User.find(function(err, users) {
        if(err)
            res.send(err);
        res.json(users);
    });
});

// return the owner of an wish
app.get('/api/wish/:id/owner', function(req, res){
    Wish.findOne({wishID: req.params.id}, function(err, wish) {
        if(err)
            res.send(err);
        User.findOne({userID: wish.owner}, function(err, user) {
            if(err)
                res.send(err);
            res.json(user);
        });
    });
});

// 查询一个user关注的人的ownwish
app.get('/api/user/:id/follow/ownwish', function(req, res){
    User.findOne({userID: req.params.id}, function(err, user) {
        if(err)
            res.send(err);
        User.find({userID: {$in: user.follow}}, function(err, users) {
            if(err)
                res.send(err);
            Wish.find({"$where": function(){
                for(var person in users) {
                }
            }});
        });
    });
});
