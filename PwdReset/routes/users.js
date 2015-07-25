var express = require('express');
var router = express.Router();
var db = require ('../models');

/* GET users listing. */
router.get('/', function(req, res, next) {
	db.User.create({username: 'ivan23', password: 'Welcome23'}).then(function (err, success) {
		if (err) return res.send(err);
		res.send('User saved');
	});
});

module.exports = router;
