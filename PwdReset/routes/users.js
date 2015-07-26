var express = require('express');
var User = require('../models').User;
var PasswordReset = require('../models').PasswordReset;


module.exports = function() {
  var router = express.Router();

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
    // User.findById(req.params.id).then(function(user) {
    //   res.send(user);
    // })
    console.log('in pwdreset');
    PasswordReset.create({
      token: '2312312jkhkahsdaas',
      userId: 22,
      expirationDate: Date.Now + 3600000
    }).then(function(pwdReset) {
      res.send(pwdReset);
    }).catch(function(err) {
      return console.log(err);
    });

  });

  router.get('/passwordreset', function(req, res, next) {
    console.log('in pwdreset');
    PasswordReset.create({
      token: '2312312jkhkahsdaas',
      userId: 22,
      expirationDate: Date.Now + 3600000
    }).then(function(pwdReset) {
      res.send(pwdReset);
    }).catch(function(err) {
      next(err)
    });
  });

  return router;
}
