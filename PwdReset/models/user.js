'use strict';

var bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      email: DataTypes.STRING
    }, {
      instanceMethods: {
        tryMe: function () {
          console.log('TRYIIING');
        },
        comparePassword: function(candidatePassword, cb) {
          console.log("COMPARING");
          var user = this;
          bcrypt.compare(candidatePassword, user.get('password'), function(err, isMatch) {
            if (err) return cb(err);
            console.log('ismatch? ' + isMatch);
            cb(null, isMatch);
          });
        }
      }
    }, {
      hooks: {
        beforeCreate: hashPassword,
        beforeUpdate: hashPassword
      }
    }, {
      classMethods: {
        associate: function(models) {
          User.hasMany(models.PasswordReset);
        }
      }
    } //, {
    // instanceMethods: {
    //   comparePassword: function(candidatePassword, cb) {
    //     console.log("COMPARING");
    //     var user = this;
    //     bcrypt.compare(candidatePassword, user.get('password'), function(err, isMatch) {
    //       if (err) return cb(err);
    //       cb(null, isMatch);
    //     });
    //   }
    // }
    //}
  );

  return User;
};


var hashPassword = function(instance, optons, next) {
  console.log(arguments);
  var SALT_FACTOR = 5;

  if (!instance.changed('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(instance.get('password'), salt, null, function(err, hash) {
      if (err) return next(err);
      instance.set('password', hash);
      console.log(instance.get('password'))
      next();
    });
  });
};
