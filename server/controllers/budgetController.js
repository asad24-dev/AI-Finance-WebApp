// controllers/budgetController.js
const { Op } = require('sequelize');
const Budget = require('../models/Budget');
const Item = require('../models/Item');
const { getCategorySpendingFromTransactions } = require('./analyticsController');
const dotenv = require('dotenv');
dotenv.config();

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    console.log('Create budget request received');
    console.log('User:', req.user);
    console.log('Request body:', req.body);
    
    if (!req.user || !req.user.userId) {
      console.log('User not authenticated');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { userId } = req.user;
    const { category, budgetAmount, period = 'monthly', alertThreshold = 0.80 } = req.body;

    console.log('Extracted data:', { userId, category, budgetAmount, period, alertThreshold });

    // Validate required fields
    if (!category || !budgetAmount) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Category and budget amount are required' });
    }

    if (budgetAmount <= 0) {
      console.log('Invalid budget amount');
      return res.status(400).json({ error: 'Budget amount must be greater than 0' });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Check if budget already exists for this category and period
    const existingBudget = await Budget.findOne({
      where: {
        userSub: userId,
        category,
        isActive: true,
        startDate: { [Op.lte]: endDate },
        endDate: { [Op.gte]: startDate }
      }
    });

    if (existingBudget) {
      return res.status(400).json({ 
        error: `A budget for ${category} already exists for this period` 
      });
    }

    // Create new budget
    console.log('Creating budget with data:', {
      userSub: userId,
      category,
      budgetAmount,
      period,
      startDate,
      endDate,
      alertThreshold,
      currentSpent: 0,
      isActive: true
    });
    
    const budget = await Budget.create({
      userSub: userId,
      category,
      budgetAmount,
      period,
      startDate,
      endDate,
      alertThreshold,
      currentSpent: 0,
      isActive: true
    });

    console.log('Budget created successfully:', budget);

    res.status(201).json({
      message: 'Budget created successfully',
      budget: {
        id: budget.id,
        category: budget.category,
        budgetAmount: parseFloat(budget.budgetAmount),
        currentSpent: parseFloat(budget.currentSpent),
        period: budget.period,
        startDate: budget.startDate,
        endDate: budget.endDate,
        alertThreshold: parseFloat(budget.alertThreshold),
        isActive: budget.isActive
      }
    });

  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
};

// Get all budgets for a user
exports.getBudgets = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { userId } = req.user;
    const { active = true, period } = req.query;

    console.log('Get budgets request for user:', userId);
    console.log('Query params:', { active, period });

    let whereClause = { userSub: userId };

    if (active !== undefined) {
      // Handle both string and boolean values
      whereClause.isActive = active === 'true' || active === true;
    }

    if (period) {
      whereClause.period = period;
    }

    console.log('Where clause:', whereClause);

    const budgets = await Budget.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    console.log('Found budgets:', budgets.length);
    console.log('Budget data:', budgets.map(b => ({ id: b.id, category: b.category, userSub: b.userSub, isActive: b.isActive })));

    // Update current spending for each budget
    const items = await Item.findAll({ where: { userSub: userId } });
    
    // Get current spending data for this month
    const now = new Date();
    let currentSpending = [];
    
    if (items.length > 0) {
      currentSpending = await getCategorySpendingFromTransactions(items, {
        date: {
          [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1),
          [Op.lte]: now
        }
      });
    }

    console.log('Current spending categories:', currentSpending.map(s => ({ category: s.category, amount: s.amount })));

    const budgetData = budgets.map(budget => {
      // Find matching spending category
      const categorySpending = currentSpending.find(
        spending => spending.category.toLowerCase() === budget.category.toLowerCase()
      );
      
      const actualSpent = categorySpending ? Math.abs(categorySpending.amount) : 0;
      
      console.log(`Budget ${budget.category}: found spending ${actualSpent} for category ${budget.category}`);
      
      // Update budget's current spent in database
      budget.update({ currentSpent: actualSpent });

      return {
        id: budget.id,
        category: budget.category,
        budgetAmount: parseFloat(budget.budgetAmount),
        currentSpent: actualSpent,
        remaining: parseFloat(budget.budgetAmount) - actualSpent,
        usagePercentage: parseFloat(budget.budgetAmount) > 0 ? actualSpent / parseFloat(budget.budgetAmount) : 0,
        period: budget.period,
        startDate: budget.startDate,
        endDate: budget.endDate,
        alertThreshold: parseFloat(budget.alertThreshold),
        isActive: budget.isActive,
        isOverBudget: actualSpent > parseFloat(budget.budgetAmount),
        isNearLimit: actualSpent >= parseFloat(budget.budgetAmount) * parseFloat(budget.alertThreshold)
      };
    });

    console.log('Returning budget data:', budgetData);

    res.json({
      budgets: budgetData,
      totalBudgets: budgetData.length,
      activeBudgets: budgetData.filter(b => b.isActive).length
    });

  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

// Update a budget
exports.updateBudget = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { userId } = req.user;
    const { id } = req.params;
    const { budgetAmount, alertThreshold, isActive } = req.body;

    const budget = await Budget.findOne({
      where: { id, userSub: userId }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Update allowed fields
    const updateData = {};
    if (budgetAmount !== undefined) {
      if (budgetAmount <= 0) {
        return res.status(400).json({ error: 'Budget amount must be greater than 0' });
      }
      updateData.budgetAmount = budgetAmount;
    }
    if (alertThreshold !== undefined) {
      if (alertThreshold < 0 || alertThreshold > 1) {
        return res.status(400).json({ error: 'Alert threshold must be between 0 and 1' });
      }
      updateData.alertThreshold = alertThreshold;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    await budget.update(updateData);

    res.json({
      message: 'Budget updated successfully',
      budget: {
        id: budget.id,
        category: budget.category,
        budgetAmount: parseFloat(budget.budgetAmount),
        currentSpent: parseFloat(budget.currentSpent),
        remaining: budget.getRemainingAmount(),
        usagePercentage: budget.getUsagePercentage(),
        period: budget.period,
        startDate: budget.startDate,
        endDate: budget.endDate,
        alertThreshold: parseFloat(budget.alertThreshold),
        isActive: budget.isActive,
        isOverBudget: budget.isOverBudget(),
        isNearLimit: budget.isNearLimit()
      }
    });

  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { userId } = req.user;
    const { id } = req.params;

    const budget = await Budget.findOne({
      where: { id, userSub: userId }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await budget.destroy();

    res.json({ message: 'Budget deleted successfully' });

  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};

// Get budget categories and suggestions
exports.getBudgetCategories = async (req, res) => {
  try {
    const categories = [
      { name: 'Food & Dining', icon: '🍽️', averageAmount: 400 },
      { name: 'Shopping', icon: '🛍️', averageAmount: 300 },
      { name: 'Transportation', icon: '🚗', averageAmount: 200 },
      { name: 'Entertainment', icon: '🎬', averageAmount: 150 },
      { name: 'Healthcare', icon: '⚕️', averageAmount: 100 },
      { name: 'Utilities', icon: '💡', averageAmount: 250 },
      { name: 'Services', icon: '🔧', averageAmount: 100 },
      { name: 'Travel', icon: '✈️', averageAmount: 200 },
      { name: 'Education', icon: '📚', averageAmount: 100 },
      { name: 'Personal Care', icon: '💄', averageAmount: 80 }
    ];

    res.json({ categories });

  } catch (error) {
    console.error('Error fetching budget categories:', error);
    res.status(500).json({ error: 'Failed to fetch budget categories' });
  }
};

module.exports = exports;
