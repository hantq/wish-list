var request = require('supertest');
var express = require('express');
var app = require('../app');

describe('testing', function(){
    it('respond with home page', function(done){
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




});
