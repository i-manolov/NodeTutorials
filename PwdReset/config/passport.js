'use strict'

var LocalStrategy = require('passport-local').Strategy;
var User = require('../models').User;

module.exports = function(passport) {

  passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({
        where: {
          username: username
        }
      })
      .then(function(user) {
        if (!user) return done(null, false, {
          message: 'Incorrect username'
        });
          console.log('USER compare' + user.comparePassword);
        user.comparePassword(password, function(err, isMatch) {
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, {
              message: 'Incorrect password.'
            });
          }
        });
      })
      .catch(function(err) {
        console.log(err)
      });
  }));
  
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id).then(function (user) {
      done(err, user);
    });
  });

  var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
  };
}
