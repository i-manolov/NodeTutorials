'use strict';
module.exports = function(sequelize, DataTypes) {
  var PasswordReset = sequelize.define('PasswordReset', {
    token: DataTypes.STRING,
    expirationDate: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
        PasswordReset.belongsTo(models.User, {
          onDelete: "CASCADE",
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });

  return PasswordReset;
}
