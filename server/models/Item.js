// server/models/Item.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Item = sequelize.define('Item', {
  item_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  access_token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Associate each Item with a User (foreign key: userId)
Item.belongsTo(User, { foreignKey: 'userSub' });
User.hasMany(Item, { foreignKey: 'userSub' });

module.exports = Item;
