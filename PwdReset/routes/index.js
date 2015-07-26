var express = require('express');
var Promise = require('bluebird');
var cryptoRandomBytes = Promise.promisify(require('crypto').randomBytes);
var flash = require('express-flash');
var nodemailer = Promise.promisifyAll(require("nodemailer"));
var smtpTransport = require('nodemailer-smtp-transport');
var User = require('../models').User;
var PasswordReset = require('../models').PasswordReset;
var sendGridSecrets = require('../config/secrets').development.sendGrid;

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

  router.get('/signup', function(req, res) {
    res.render('signup', {
      user: req.user
    });
  });

  router.post('/signup', function(req, res, next) {
    User.create({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    }).then(function(user) {
      req.logIn(user, function(err) {
        res.redirect('/login');
      });
    }).catch(function(err) {
      console.log('in errrrr');
      return next(err);
    });
  });

  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  router.get('/forgot', function(req, res) {
    res.render('forgot', {
      user: req.user
    });
  });

  router.post('/forgot', function(req, res, next) {

    User.findOne({
      where: {
        email: req.body.email
      }
    }).then(function(user) {
      if (!user) {
        req.flash('error', 'No account with such email');
        return res.redirect('/forgot');
      }
      return user;
    }).then(function(user) {
      cryptoRandomBytes(20).then(function(buf) {
        var token = buf.toString('hex');
        PasswordReset.create({
          token: token,
          expirationDate: Date.now() + 3600000,
          userId: user.id
        }).then(function(pwdReset) {
          var transporter  = nodemailer.createTransport(smtpTransport({
            service: 'SendGrid',
            auth: {
              user: sendGridSecrets.user,
              pass: sendGridSecrets.pass
            }
          }));
          var mailOptions = {
            to: user.email,
            from: 'passwordreset@demo.com',
            subject: 'Node.js Password Reset',
            text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
              'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
              'http://' + req.headers.host + '/reset/' + token + '\n\n' +
              'If you did not request this, please ignore this email and your password will remain unchanged.\n'
          };
          transporter.sendMail(mailOptions, function(err) {
            req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
            return res.redirect('/forgot');
          });
        });
      });
    }).catch(function (err) {
      return next(err);
    });
  });

  router.get('/reset/:token', function(req, res, next) {
    PasswordReset.findOne({ where: { token: req.params.token, expirationDate: {gt: new Date()}}}).then(function (pwdReset) {
      if (!pwdReset) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {
        user: req.user
      });
    }).catch(function (err) {
      return next(err);
    });
  });

  router.post('/reset/:token', function (req, res, next) {
    PasswordReset.findOne({ where: { token: req.params.token, expirationDate: {gt: new Date()}}, include: [{model: User}]}).then(function (pwdReset) {
      if (!pwdReset) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }

      User.update({ password: req.body.password }, { where: { id: pwdReset.userId }, individualHooks: true}).then(function (user){
        PasswordReset.destroy({where: {id: pwdReset.id}});
        req.flash('success', 'Password reset was successful');
        res.redirect('/login');
      });
    }).catch(function (err) {
      return next(err);
    });
  });

  return router;
}
