// controllers/budgetController.js
const { Op } = require('sequelize');
const Budget = require('../models/Budget');

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { userId } = req.user;
    const { category, budgetAmount, period = 'monthly', alertThreshold = 0.80 } = req.body;

    // Validate required fields
    if (!category || !budgetAmount) {
      return res.status(400).json({ error: 'Category and budget amount are required' });
    }

    if (budgetAmount <= 0) {
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

    let whereClause = { userSub: userId };

    if (active !== undefined) {
      whereClause.isActive = active === 'true';
    }

    if (period) {
      whereClause.period = period;
    }

    const budgets = await Budget.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    const budgetData = budgets.map(budget => ({
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
    }));

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
