// models/Budget.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userSub: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'sub'
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  budgetAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currentSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  period: {
    type: DataTypes.ENUM('weekly', 'monthly', 'yearly'),
    defaultValue: 'monthly'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  alertThreshold: {
    type: DataTypes.DECIMAL(3, 2), // Percentage as decimal (0.80 for 80%)
    defaultValue: 0.80,
    validate: {
      min: 0,
      max: 1
    }
  }
}, {
  tableName: 'budgets',
  timestamps: true,
  indexes: [
    {
      fields: ['userSub']
    },
    {
      fields: ['category']
    },
    {
      fields: ['startDate', 'endDate']
    }
  ]
});

// Instance methods
Budget.prototype.getUsagePercentage = function() {
  return this.budgetAmount > 0 ? (this.currentSpent / this.budgetAmount) : 0;
};

Budget.prototype.getRemainingAmount = function() {
  return Math.max(0, this.budgetAmount - this.currentSpent);
};

Budget.prototype.isOverBudget = function() {
  return this.currentSpent > this.budgetAmount;
};

Budget.prototype.isNearLimit = function() {
  return this.getUsagePercentage() >= this.alertThreshold;
};

module.exports = Budget;
