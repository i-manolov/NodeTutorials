var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var nodemailer = require('nodemailer');
var passport = require('passport');
var async = require('async');
var crypto = require('crypto');

// var routes = require('./routes/index');
var users = require('./routes/users');

require ('./config/passport')(passport);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.set('port', process.argv[2] || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(session({
  secret: 'my super duper secret key',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes)(passport);
app.use('/users', users);

// Routes
app.get('/', function(req, res) {
  res.render('index', {
    title: 'Express'
  });
});

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Express',
    user: req.user
  });
});

app.get('/login', function(req, res) {
  res.render('login', {
    user: req.user
  });
});

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) return next(err);
    if (!user) {
      return res.redirect('/login')
    }
    req.login(user, function(err) {
      if (err) return next(err);
      return res.redirect('/users/' + req.user.id);
    });
  })(req, res, next);
});

app.post('/signup', function(req, res, next) {
  var User = require('./models').User;
  User.create({
    username: 'ivan',
    password: 'Welcome23',
    email: 'ivan-manolov@hotmail.com'
  }).then(function(user) {
      req.logIn(user, function(err) {
            res.redirect('/login');
          });
  }).catch (function(err) {
    return next(err);
  });

  // user.save(function(err) {
  //   req.logIn(user, function(err) {
  //     res.redirect('/');
  //   });
  // });
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/signup', function(req, res) {
  res.render('signup', {
    user: req.user
  });
});



app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
