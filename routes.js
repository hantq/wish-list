var async = require('async');
var crypto = require('crypto');
var User = require('./models/user');
var Wish = require('./models/wish');
var Tag = require('./models/tag');

module.exports = function(app) {
//  home page
	app.get('/', function(req, res) {
		res.send('homepage');
	});

//  get a wish
//  app.get('/api/wish/:id', checkLogin);
    app.get('/api/wish/:id', function(req, res) {
        var wishset = {};
        var tag = [];
        Wish.findOne({wishID: req.params.id}, function(err, wish) {
            if(err)
                res.send(err);
            else if(!wish) {
                res.send('Wrong Wish ID!');
            } else {
                Tag.find({tagID: {$in: wish.meta.tag}}, function(err, tags) {
                    if(err)
                        res.send(err);
                    else {
                        tag = tags;
                        User.findOne({userID: wish.owner}, function(err, user) {
                            if(err)
                                res.send(err);
                            else {
                                wishset = {
                                    wish : wish,
                                    owner: user,
                                    tag  : tag
                                };
                                console.log(wishset);
                                res.send(wishset);
                            }  
                        });
                    }
                });
            } 
        });
    });

//  get an user
//  app.get('/api/user/:id', checkLogin);
    app.get('/api/user/:id', function(req, res) {
        var userset = {};
        var ownwishlist = [];
        var orderwishlist = [];
        var favtag = [];
        User.findOne({userID: req.params.id}, function(err, user) {
            if(err)
                res.send(err);
            else if(!user)
                res.send('Wrong User ID!');
            else {
                Wish.find({wishID: {$in: user.ownwish}}, {sort: [['meta.addeddate', -1]]}, function(err, ownwishes) {
                    if(err)
                        res.send(err);
                    else {
                        ownwishlist = ownwishes;
                        Wish.find({wishID: {$in: user.orderwish}}, {sort: [['meta.completedate', -1]]}, function(err, orderwishes) {
                            if(err)
                                res.send(err);
                            else {
                                orderwishlist = orderwishes;
                                Tag.find({tagID: {$in: user.meta.favtag}}, function(err, tags) {
                                    if(err)
                                        res.send(err);
                                    else {
                                        favtag = tags;
                                        userset = {
                                            user:          user,
                                            ownwishlist:   ownwishlist,
                                            orderwishlist: orderwishlist,
                                            favtag:        favtag
                                        };
                                        console.log(userset);
                                        res.send(userset);
                                    }
                                });
                            }
                        });
                    }   
                });
            }   
        });
    });

//  create an user, sign up
//  app.post('/signup', checkNotLogin);
    app.post('/api/signup', function(req, res){
	    console.log(req.body);
        var md5 = crypto.createHash('md5'),
            password_md5 = md5.update(req.body.password).digest('hex');
        var newUser = new User({
            password: password_md5,
            'meta.email': req.body.meta.email,
            'meta.nickname': req.body.meta.nickname,
            'meta.realname': req.body.meta.realname,
            'meta.birthday': req.body.meta.birthday,
            'meta.favtag': req.body.meta.favtag,
            'meta.avatar': req.body.meta.avatar
        });
        newUser.save(function(err) {
            if(err)
                res.send(err);
            else {
                console.log(newUser);
                res.send(newUser);
            }
        });
    });

//  sign in
//  app.post('/signin', checkNotLogin);
    app.post('/api/signin', function(req, res) {
        var email = req.body.meta.email;
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        User.findOne({'meta.email': email}, function(err, user) {
            if(err)
                res.send(err);
            else if(!user)
                res.send('Wrong Email!');
            else if(password == user.password) {
                req.session.user = user;
                console.log(user);
                res.send(user);
            } else {
                res.send('Wrong Password!');
            }
        });
    });

//  create an wish
//  app.post('/api/wish', checkLogin);
    app.post('/api/wish', function(req, res){
        var newWish = new Wish(req.body);
        newWish.save(function(err) {
            if(err)
                res.send(err);
            else {
                console.log(newWish);
                res.send(newWish);
            }
        });
    });

//  update an user
//  app.put('/api/user/:id', checkLogin);
    app.put('/api/user/:id', function(req, res){
        // if(req.params.id == req.session.user.userID) {
            var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
            User.findOne({userID: req.params.id}, function(err, user) {
                if(err)
                    res.send(err);
                else if(!user)
                    res.send('Wrong User ID!');
                else {
                    user.password = password;
                    user.meta.email = req.body.meta.email;
                    user.meta.nickname = req.body.meta.nickname;
                    user.meta.realname = req.body.meta.realname;
                    user.meta.birthday = req.body.meta.birthday;
                    user.meta.address = req.body.meta.address;
                    user.meta.favtag = req.body.meta.favtag;
                    user.meta.avatar = req.body.meta.avatar;
                    user.follow = req.body.follow;
                    user.ownwish = req.body.ownwish;
                    user.orderwish = req.body.orderwish;
                    user.save(function(err) {
                        if(err)
                            res.send(err);
                        else {
                            console.log(user);
                            res.send(user);
                        }
                    });
                }
            });
        // }
    });

//  update a wish
//  app.put('/api/wish/:id', checkLogin);
    app.put('/api/wish/:id', function(req, res) {
        Wish.findOne({wishID: req.params.id}, function(err, wish) {
            if(err)
                res.send(err);
            else if(!wish)
                res.send('Wrong Wish ID!');
            else {
                wish.owner = req.body.owner;
                wish.meta.name = req.body.meta.name;
                wish.meta.pic = req.body.meta.pic;
                wish.meta.addeddate = req.body.meta.addeddate;
                wish.meta.completedate = req.body.meta.completedate;
                wish.meta.deadline = req.body.meta.deadline;
                wish.meta.link = req.body.meta.link;
                wish.meta.location = req.body.meta.location;
                wish.meta.priority = req.body.meta.priority;
                wish.meta.tag = req.body.meta.tag;
                wish.authority = req.body.authority;
                wish.ordered = req.body.ordered;
                wish.completed = req.body.completed;
                wish.save(function(err) {
                    if(err)
                        res.send(err);
                    else {
                        console.log(wish);
                        res.send(wish);
                    }
                });
            }
        });
    });

//  delete an wish
//  app.delete('/api/wish/:id', checkLogin);
    app.delete('/api/wish/:id', function(req, res){
        Wish.remove({wishID: req.params.id}, function(err) {
            if(err)
                res.send(err);
            else
                console.log("wish " + req.params.id + "removed.");
        });
    });

//  return 10 random wishes
    app.get('/api/everyonewish', function(req, res){
        Wish.find({}, {limit: 10, sort: [['meta.addeddate', -1]]}, function(err, wishes){
            if(err)
                res.send(err);
            else {
                var wisharray = [];
                async.eachSeries(wishes, function(wish, callback) {
                    User.findOne({userID: wish.owner}, function(err, owner) {
                        if(err)
                            res.send(err);
                        else {
                            Tag.find({tagID: {$in: wish.meta.tag}}, function(err, tags) {
                                if(err)
                                    res.send(err);
                                else {
                                    var tag = tags;
                                    var wishset = {
                                        wish : wish,
                                        owner: user,
                                        tag  : tag
                                    };
                                    wisharray.push(wishset);
                                }
                            });
                        }
                    });
                    callback();
                }, function(err) {
                    res.send(err);
                });


                console.log(wishes);
                res.send(wishes);
            }
        });
    });

// 

// 查询一个user关注的人的ownwish
    app.get('/api/user/:id/follow/ownwish', function(req, res){
        User.findOne({userID: req.params.id}, function(err, user) {
            if(err)
                res.send(err);
            if(!user)
                res.send('Wrong User ID!');
            User.find({userID: {$in: user.follow}}, function(err, users) {
                if(err)
                    res.send(err);
                Wish.find({"$where": function(){
                    // if wish.authority=0 ||
                    // wish.authority=1 && user in p.follow
                    wishes = [];
                    async.forEach(users, function(p, callback) {
                        Wish.findOne({wishID: {$in: p.ownwish}}, function(err, w){
                            if(err)
                                res.send(err);
                            if(w.authority == 0) {
                                wishes.push(w);
                            } else if(w.authority == 1) {
                                // if p follow user
                                async.forEach(p.follow, function(pf, callback) {
                                    if(pf == user.userID) {
                                        wishes.push(w);
                                    }
                                });
                            }
                        });
                    }, function(err) {
                        res.send(err);
                    });
                    wishes.sort(function(a, b) {
                        return a.meta.addeddate < b.meta.addeddate ? 1 : -1;
                    });
                    console.log(wishes);
                    res.json(wishes);
                }});
            });
        });
    });

    function checkLogin(req, res, next) {
        if (!req.session.user) {
            res.send('Not Sign In!');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            res.send('Sign in!');
        }
        next();
    }
};
