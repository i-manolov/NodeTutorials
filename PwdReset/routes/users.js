var express = require('express');
var router = express.Router();
var User = require('../models').User;


module.exports = function(passport) {
  /* GET users listing. */
  router.get('/', function(req, res, next) {
    User.create({
      username: 'ivan23',
      password: 'Welcome23',
      email: 'ivan@ivan.com'
    }).then(function(user) {}).catch(function(err) {
      return next(err);
    });
  });

  router.get('/:id', function(req, res, next) {
    User.findById(req.params.id).then(function(user) {
      res.send(user);
    })
  });
}
