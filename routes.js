var async = require('async');
var crypto = require('crypto');
var User = require('./models/user');
var Wish = require('./models/wish');
var Tag = require('./models/tag');
var fs = require('fs');
var multiparty = require('multiparty');

exports.index = function(req, res) {
    res.send('homepage');
};

exports.signup = function(req, res) {
    var md5 = crypto.createHash('md5'),
        password_md5 = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        password: password_md5,
        meta: {
            email: req.body.meta.email,
            nickname: req.body.meta.nickname
        }
    });
    newUser.save(function(err) {
        if (err) {
            console.log(err);
            if(err.code == 11000)
                res.send({
                    code: 100
                });    // email already exists
        }
        else {
            console.log(newUser);
            res.send(newUser);
        }
    });
};

exports.signin = function(req, res) {
    var email = req.body.meta.email;
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    User.findOne({'meta.email': email}, function(err, user) {
        if(err)
            res.send(err);
        else if(!user)
            res.send({
                code: 101
            }); // wrong email
        else if(password == user.password) {
            req.session.user = user;
            console.log(user);
            res.send(user);
        } else {
            res.send({
                code: 101
            });  // wrong password
        }
    });
};

exports.signout = function(req, res) {
    req.session.user = null;
    res.send('Sign Out!');
};

exports.getAWishSet = function(req, res) {
    Wish.findOne({wishID: req.params.id}, function(err, wish) {
        if(err)
            res.send(err);
        else if(!wish) {
            res.send('Wrong Wish ID!');
        } else {
            var currentuser = req.session.user;
            var blocked = 0;
            if(currentuser.userID != wish.owner.userID && wish.authority == 2)
                blocked = 1;
            else if(wish.authority == 1) {
                User.findOne({userID: {$in: wish.owner.follow}}, function (err, follower) {
                    if (err)
                        res.send(err);
                    else if (!follower) {
                        blocked = 1;
                    }
                    else {
                        Tag.find({tagID: {$in: wish.meta.tag}}, function(err, tags) {
                            if(err)
                                res.send(err);
                            else {
                                User.findOne({userID: wish.owner}, function(err, user) {
                                    if(err)
                                        res.send(err);
                                    else {
                                        var wishset = {
                                            wish : wish,
                                            owner: user,
                                            tag  : tags
                                        };
                                        console.log(wishset);
                                        res.send(wishset);
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                Tag.find({tagID: {$in: wish.meta.tag}}, function(err, tags) {
                    if(err)
                        res.send(err);
                    else {
                        User.findOne({userID: wish.owner}, function(err, user) {
                            if(err)
                                res.send(err);
                            else {
                                wishset = {
                                    wish : wish,
                                    owner: user,
                                    tag  : tags
                                };
                                console.log(wishset);
                                res.send(wishset);
                            }
                        });
                    }
                });
            }
        }
    });
};

exports.getAUserSet = function(req, res) {
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
                    Wish.find({wishID: {$in: user.orderwish}}, {sort: [['meta.completedate', -1]]}, function(err, orderwishes) {
                        if(err)
                            res.send(err);
                        else {
                            Tag.find({tagID: {$in: user.meta.favtag}}, function(err, tags) {
                                if(err)
                                    res.send(err);
                                else {
                                    var userset = {
                                        user:          user,
                                        ownwishlist:   ownwishes,
                                        orderwishlist: orderwishes,
                                        favtag:        tags
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
};

exports.addAWish = function(req, res) {
    var newWish = new Wish(req.body);
    newWish.save(function(err) {
        if(err)
            res.send(err);
        else {
            console.log(newWish);
            res.send(newWish);
        }
    });
};

exports.updateUser = function(req, res) {
    if(req.params.id == req.session.user.userID) {
        console.log(req.session.user);
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
    }
    else {
        res.send('Wrong User ID!');
    }
};

exports.updateWish = function(req, res) {
    Wish.findOne({wishID: req.params.id}, function(err, wish) {
        if(err)
            res.send(err);
        else if(!wish)
            res.send('Wrong Wish ID!');
        else {
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
};

exports.deleteWish = function(req, res) {
    Wish.remove({wishID: req.params.id}, function(err) {
        if(err)
            res.send(err);
        else
            console.log("wish " + req.params.id + "removed.");
    });
};

exports.everyoneWish = function(req, res) {
    Wish.find({authority: 0}, {limit: 10, sort: [['meta.addeddate', -1]]}, function(err, wishes){
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
                                var wishset = {
                                    wish : wish,
                                    owner: owner,
                                    tag  : tags
                                };
                                wisharray.push(wishset);
                                callback();
                            }
                        });
                    }
                });
            }, function(err) {
                if(err)
                    res.send(err);
                else {
                    console.log(wisharray);
                    res.send(wisharray);
                }
            });
        }
    });
};

exports.getfollowuser = function(req, res) {
    User.findOne({userID: req.params.id}, function(err, user) {
        if(err)
            res.send(err);
        else if(!user)
            res.send('Wrong User ID!');
        else {
            User.find({userID: {$in: user.follow}}, function(err, users) {
                if(err)
                    res.send(err);
                else {
                    var userarray = [];
                    var userset = {};
                    async.eachSeries(users, function(following, callback) {
                        User.findOne({userID: following.userID}, function(err, owner) {
                            if(err)
                                res.send(err);
                            else {
                                Tag.find({tagID: {$in: wish.meta.tag}}, function(err, tags) {
                                    if(err)
                                        res.send(err);
                                    else {
                                        var wishset = {
                                            wish : wish,
                                            owner: owner,
                                            tag  : tags
                                        };
                                        wisharray.push(wishset);
                                        callback();
                                    }
                                });
                            }
                        });
                    }, function(err) {
                        if(err)
                            res.send(err);
                        else {
                            console.log(wisharray);
                            res.send(wisharray);
                        }
                    });











                }
            });







        }
    });
};

exports.getfollowuserwish = function(req, res) {
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
};

exports.upload = function(req, res) {
    var form = new multiparty.Form({
        autoFiles: true,
        uploadDir: './uploads/tmp'
    });
    var fileName = new Date().getTime() + '_';
    //为了文件名不冲突，用时间做标志
    form.on('part', function(part){
        if(!part.filename) return;
        fileName += part.filename;
        console.log(fileName);
    });
    form.on('file', function(name, file){
        console.log('name: ' + name);
        console.log('file.path: ' + file.path);
        console.log('fileName: '+ fileName);
        var tmp_path = file.path;
        var images_path = '/usersUploads/images/';
        var target_path = './public'+ images_path + fileName;
        fs.renameSync(tmp_path, target_path, function(err) {
            if(err) console.error(err.stack);
        });
        res.send(images_path + fileName);
    });
    form.parse(req);
};

exports.fulfill = function(req, res) {

};

exports.collect = function(req, res) {

};
