// server/models/Item.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

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

export default Item;
