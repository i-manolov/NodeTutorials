var express = require('express');


module.exports = function(passport) {

  var router = express.Router();

  /* GET home page. */
  router.get('/', function(req, res) {
    console.log('REQ USER: ' + req.user);
    res.render('index', {
      title: 'Express',
      user: req.user
    });
  });

  router.get('/login', function(req, res) {
    res.render('login', {
      user: req.user
    });
  });

  router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) return next(err);
      if (!user) {
        return res.redirect('/login')
      }
      req.login(user, function(err) {
        if (err) return next(err);
        return res.redirect('/');
      });
    })(req, res, next);
  });

  router.post('/signup', function(req, res, next) {
    var User = require('./models').User;
    User.create({
      username: 'ivan',
      password: 'Welcome23',
      email: 'ivan-manolov@hotmail.com'
    }).then(function(user) {
      req.logIn(user, function(err) {
        res.redirect('/login');
      });
    }).catch(function(err) {
      return next(err);
    });
  });

  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  router.get('/signup', function(req, res) {
    res.render('signup', {
      user: req.user
    });
  });

  return router;
}
