var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');

var app = express();

// 解决跨域请求问题
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
    next();
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.urlencoded());
app.use(express.json());
//app.use(express.bodyParser());
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

// routes
app.post('/api/signup', checkNotLogin);
app.post('/api/signup', routes.signup);

app.post('/api/signin', checkNotLogin);
app.post('/api/signin', routes.signin);

app.get('/api/logout', checkLogin);
app.get('/api/logout', routes.signout);

app.get('/api/wish/:id', checkLogin);
app.get('/api/wish/:id', routes.getAWishSet);  // return wishset
app.get('/api/user/:id', checkLogin);
app.get('/api/user/:id', routes.getAUserSet);  // return userset

//app.post('/api/wish', checkLogin);
app.post('/api/wish', routes.addAWish);  // return wish

app.put('/api/user/:id', checkLogin);
app.put('/api/user/:id', routes.updateUser);  // return user
app.put('/api/wish/:id', checkLogin);
app.put('/api/wish/:id', routes.updateWish);  // return wish

app.delete('/api/wish/:id', checkLogin);
app.delete('/api/wish/:id', routes.deleteWish);

app.get('/api/everyonewish', routes.everyoneWish);  // return [wishset]

app.post('/api/followquery', checkLogin);
app.post('/api/followquery', routes.follow);
app.post('/api/unfollowquery', checkLogin);
app.post('/api/unfollowquery', routes.unfollow);

app.get('/api/user/:id/followuser', checkLogin);
app.get('/api/user/:id/followuser', routes.getfollowuser);  // return [user]
app.get('/api/user/:id/followuserwish', checkLogin);
app.get('/api/user/:id/followuserwish', routes.getfollowuserwish);  // return [wishset]

app.post('/api/upload', checkLogin);
app.post('/api/upload', routes.upload);

app.post('/api/fulfill/:userid/:wishid', checkLogin);
app.post('/api/fulfill/:userid/:wishid', routes.fulfill);
app.post('/api/collect/:userid/:wishid', checkLogin);
app.post('/api/collect/:userid/:wishid', routes.collect);

app.get('/api/search', routes.search);

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.session.error = 'Not Sign In!';
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.session.error = 'Sign In!';
    }
    next();
}

module.exports = app;
