var request = require('supertest');
var express = require('express');
var app = require('../app');

describe('testing', function(){
  /*  it('respond with home page', function(done){
        request(app)
            .get('/')
            .expect(200)
            .end(function(err, res) {
                if(err)
                    done(err);
                else
                    done();
            });
    });
    */
/*
    var postData = {
        "password": "123456",
        "meta": {
            "email": "1234@1234567890.com",
            "nickname": "xiaoming"
        }
    };
    it('respond with new user', function(done){
        request(app)
            .post('/api/signup')
            .send(postData)
            .end(function(err, res) {
                if(err)
                    done(err);
                else
                    done();
            });
    });
*/
/*
    var postData = {
        "meta": {
            "name": "iPhone 5"
        }
    };
    it('respond with new wish', function(done){
        request(app)
            .post('/api/wish')
            .send(postData)
            .end(function(err, res) {
                if(err)
                    done(err);
                else
                    done();
            });
    });
*/

    it('respond with search', function(done) {
        request(app)
            .get('/api/search?s=213')
            .end(function(err, res) {
                if(err)
                    done(err);
                else
                    done();
            });
    });





});
