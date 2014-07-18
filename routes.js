var async = require('async');
var crypto = require('crypto');
var User = require('./models/user');
var Wish = require('./models/wish');
var Tag = require('./models/tag');
var fs = require('fs');
var multiparty = require('multiparty');

Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if(index > -1) {
        this.splice(index, 1);
    }
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
    res.send('已登出');
};

exports.follow = function(req, res) {
    var user = req.body.uid,
        follow = req.body.fid;
    User.findOne({userID: user}, function(err, u) {
        if(err)
            res.send(err);
        else if(!u)
            res.send("找不到用户");
        else {
            u.follow.push(follow);
            u.save(function(err) {
                if(err)
                    res.send(err);
                else {
                    console.log(u);
                    res.send(u);
                }
            });
        }
    });
};

exports.unfollow = function(req, res) {
    var user = req.body.uid,
        unfollow = req.body.fid;
    User.findOne({userID: user}, function(err, u) {
        if(err)
            res.send(err);
        else if(!u)
            res.send("找不到用户");
        else {
            u.follow.remove(unfollow);
            u.save(function(err) {
                if(err)
                    res.send(err);
                else {
                    console.log(u);
                    res.send(u);
                }
            });
        }
    });
};

exports.getAWishSet = function(req, res) {
    Wish.findOne({wishID: req.params.id}, function(err, wish) {
        if(err)
            res.send(err);
        else if(!wish) {
            res.send('找不到这个愿望');
        } else {
            var currentuser = req.session.user;
            var wishset = {};
            if(!currentuser || wish.authority == 0) {
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
            else if(currentuser.userID == wish.owner.userID && wish.authority == 2) {
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
            res.send('找不到这个用户');
        else {
              console.log(user.ownwish);
               Wish.find({wishID: {$in: user.ownwish}}).sort({'meta.addeddate': -1}).exec(function(err, ownwishes) {
                if(err)
                    res.send(err);
                else {
                    console.log("WishSet Ownwishes: " + ownwishes);
                    Wish.find({wishID: {$in: user.orderwish}}).sort({'meta.completedate': -1}).exec(function(err, orderwishes) {
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
    if(req.body.meta.tag) {
        var tagStringArray = req.body.meta.tag;
        console.log(req.body.meta.tag);
        var wishTags = [];
        async.eachSeries(tagStringArray, function(tagString, callback){
            Tag.findOne({name: tagString}, function(err, findtag){
                if(err)
                    res.send(err);
                else if(findtag) {
                    wishTags.push(findtag.tagID);
                    callback();
                } else {
                    var newTag = new Tag({
                        name: tagString
                    });
                    newTag.save(function(err){
                        if(err)
                            res.send(err);
                        else {
                            console.log(newTag);
                            wishTags.push(newTag.tagID);
                            callback();
                        }
                    });
                }
            });
        }, function(err) {
            if(err)
                res.send(err);
            else {
                var newWish = new Wish({
                    meta: {
                        name: req.body.meta.name,
                        describe: req.body.meta.describe || '',
                        pic: req.body.meta.pic || '',
                        addeddate: new Date().toISOString().slice(0,10),
                        completedate: req.body.meta.completedate || '',
                        deadline: req.body.meta.deadline || '',
                        link: req.body.meta.link || '',
                        location: req.body.meta.location || '',
                        priority: req.body.meta.priority || 0,
                        tag: wishTags
                    },
                    authority: req.body.authority || 0,
                    ordered: req.body.ordered || 0,
                    completed: req.body.completed || false,
                    owner: req.body.owner
                });
                newWish.save(function(err) {
                    if(err)
                        res.send(err);
                    else {
                        console.log(newWish);
                        User.findOne({userID: newWish.owner}, function(err, user) {
                            if(err)
                                res.send(err);
                            else if(user) {
                                user.ownwish.push(newWish.wishID);
                                user.save(function(err) {
                                    if(err)
                                        res.send(err);
                                    else {
                                        console.log("in user save newwish: "+newWish);
                                        var tmp = {
                                            wishID: newWish.wishID
                                        };
                                        console.log("in user save tmp: "+tmp);
                                        res.json(tmp);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        var newWish = new Wish({
            meta: {
                name: req.body.meta.name,
                describe: req.body.meta.describe || '',
                pic: req.body.meta.pic || '',
                addeddate: new Date().toISOString().slice(0,10),
                completedate: req.body.meta.completedate || '',
                deadline: req.body.meta.deadline || '',
                link: req.body.meta.link || '',
                location: req.body.meta.location || '',
                priority: req.body.meta.priority || 0,
                tag: []
            },
            authority: req.body.authority || 0,
            ordered: req.body.ordered || 0,
            completed: req.body.completed || false,
            owner: req.body.owner
        });
        newWish.save(function(err) {
            if(err)
                res.send(err);
            else {
                console.log(newWish);
                User.findOne({userID: newWish.owner}, function(err, user) {
                    if(err)
                        res.send(err);
                    else if(user) {
                        user.ownwish.push(newWish.wishID);
                        user.save(function(err) {
                            if(err)
                                res.send(err);
                            else {
                                console.log("in user save newwish: "+newWish);
                                var tmp = {
                                    wishID: newWish.wishID
                                };
                                console.log("in user save tmp: "+tmp);
                                res.json(tmp);
                            }
                        });
                    }
                });
            }
        });
    }
};

exports.updateUser = function(req, res) {
         console.log(req.session.user);
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        User.findOne({userID: req.params.id}, function(err, user) {
            if(err)
                res.send(err);
            else if(!user)
                res.send('找不到这个用户');
            else {
                user.password = password;
//                user.meta.email = req.body.meta.email;
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
};

exports.updateWish = function(req, res) {
    Wish.findOne({wishID: req.params.id}, function(err, wish) {
        if(err)
            res.send(err);
        else if(!wish)
            res.send('找不到这个愿望');
        else {
            wish.meta.name = req.body.meta.name;
            wish.meta.describe = req.body.meta.describe;
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
            console.log("愿望已被删除");
    });
};

exports.everyoneWish = function(req, res) {
    Wish.find({authority: 0, completed: false}).sort({'wishID': -1}).limit(10).exec(function(err, wishes) {
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
            res.send('找不到用户');
        else {
            User.find({userID: {$in: user.follow}}, function(err, users) {
                if(err)
                    res.send(err);
                else {
                    console.log(users);
                    res.send(users);
                }
            });
        }
    });
};

exports.getfollowuserwish = function(req, res) {
    var wisharray = [];
    var wishset = {};
    User.findOne({userID: req.params.id}, function(err, user) {
        if(err)
            res.send(err);
        if(!user)
            res.send('找不到用户');
        else {
            User.find({userID: {$in: user.follow}}, function(err, users) {
                if(err)
                    res.send(err);
                else if(users.length == 0 || !users)
                    res.send(wisharray);
                else {
 //                   Wish.find({"$where": function() {
                        async.eachSeries(users, function(following, callback) {
                            Wish.find({wishID: {$in: following.ownwish}}, function(err, wishes){
                                if(err)
                                    res.send(err);
                                else if(wishes.length > 0) {
                                    async.eachSeries(wishes, function(wish, callback) {
                                        if(wish.authority == 0) {
                                            Tag.find({tagID: {$in: wish.meta.tag}}, function(err, tags) {
                                                if(err)
                                                    res.send(err);
                                                else {
                                                    wishset = {
                                                        wish: wish,
                                                        owner: following,
                                                        tag: tags
                                                    };
                                                    wisharray.push(wishset);
                                                    callback();
                                                }
                                            });
                                        } else if(wish.authority == 1) {
                                            // following follows user
                                            if (following.follow.indexOf(user.userID) > -1) {
                                                Tag.find({tagID: {$in: wish.meta.tag}}, function (err, tags) {
                                                    if (err)
                                                        res.send(err);
                                                    else {
                                                        wishset = {
                                                            wish: wish,
                                                            owner: following,
                                                            tag: tags
                                                        };
                                                        wisharray.push(wishset);
                                                        callback();
                                                    }
                                                });
                                            }
                                        }
                                    }, function(err) {
                                        if(err)
                                            res.send(err);
                                        callback();
                                    });
                                }
                            });
                        }, function(err) {
                            if(err)
                                res.send(err);
                            else {
                                wisharray.sort(function(a, b) {
                                    return a.wish.wishID < b.wish.wishID ? 1 : -1;
                                });
                                console.log(wisharray);
                                res.send(wisharray);
                            }
                        });
 //                   }});
                }
           });
        }
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
        var tmp_path = file.path;
        var images_path = '/usersUploads/images/';
        var target_path = './public'+ images_path + fileName;
        fs.renameSync(tmp_path, target_path, function(err) {
            if(err) console.error(err.stack);
        });
        console.log("fileName: "+fileName);
        res.send(images_path + fileName);
    });
    form.parse(req);
};

exports.complete = function(req, res) {
    var wishid = req.body.wid;
    Wish.findOne({wishID: wishid}, function(err, wish) {
        if(err)
            res.send(err);
        else if(!wish)
            res.send("找不到愿望");
        else {
            wish.completed = true;
            console.log("wiw" + wish.completed);
            wish.meta.completedate = new Date().toISOString().slice(0,10);
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

exports.fulfill = function(req, res) {
    var myid = req.body.mid,
        wishid = req.body.wid;
    Wish.findOne({wishID: wishid}, function(err, wish) {
        if(err)
            res.send(err);
        else if(!wish)
            res.send("没找到wish");
        else {
            wish.ordered = myid;
            wish.save(function(err) {
                if(err)
                    res.send(err);
                else {
                    User.findOne({userID: myid}, function(err, me) {
                        if(err)
                            res.send(err);
                        else if(!me)
                            res.send("找不到用户");
                        else {
                            me.orderwish.push(wishid);
                            me.save(function(err) {
                                if(err)
                                    res.send(err);
                                else {
                                    res.send("已预订");
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

exports.unfulfill = function(req, res) {
    var myid = req.body.mid,
        wishid = req.body.wid;
    Wish.findOne({wishID: wishid}, function(err, wish) {
        wish.ordered = 0;
        wish.save(function(err) {
            if(err)
                res.send(err);
            else {
                User.findOne({userID: myid}, function(err, me) {
                    if(err)
                        res.send(err);
                    else if(!me)
                        res.send("找不到用户");
                    else {
                        me.orderwish.remove(wishid);
                        me.save(function(err) {
                            if(err)
                                res.send(err);
                            else {
                                res.send("已取消预订");
                            }
                        });
                    }
                });
            }
        });
    });
};

exports.orderwishlist = function(req, res) {
    var userid = req.body.uid;
    User.findOne({userID: userid}, function(err, user) {
        if(err)
            res.send(err);
        else if(!user)
            res.send("找不到用户");
        else {
            var wisharray = [];
            Wish.find({wishID: {$in: user.orderwish}}, function(err, wishes) {
                if(err)
                    res.send(err);
                else if(!wishes)
                    res.send("找不到愿望");
                else {
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
        }
    });
};

exports.collect = function(req, res) {
    var userid = req.body.uid,
        wishid = req.body.wid;
    Wish.findOne({wishID: wishid}, function(err, wish) {
        var newWish = new Wish(wish);
        newWish.owner = userid;
        newWish.addeddate = new Date().toISOString().slice(0,10);
        newWish.save(function(err) {
            if(err)
                res.send(err);
            else {
                console.log(newWish);
                res.send(newWish);
            }
        });
    });
};

exports.search = function(req, res) {
    if(req.query.s) {
        var re = new RegExp(req.query.s, 'i');
        User.find().or([{'meta.email': {$regex: re}}, {'meta.nickname': {$regex: re}}, {'meta.realname': {$regex: re}}]).exec(function(err, users) {
            if(err)
                res.send(err);
            else {
                res.send(users);
            }
        });
    }
    else {
        res.send([{
            code: 102  // search blank
        }]);
    }
};
