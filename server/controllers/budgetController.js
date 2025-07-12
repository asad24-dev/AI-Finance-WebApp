// controllers/budgetController.js
const { Op } = require('sequelize');
const Budget = require('../models/Budget');
const Item = require('../models/Item');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const dotenv = require('dotenv');
dotenv.config();

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Enhanced category mapping (consistent with analyticsController)
const CATEGORY_MAPPING = {
  // Primary Plaid categories
  'Food and Drink': 'Food & Dining',
  'Shops': 'Shopping', 
  'Recreation': 'Entertainment',
  'Transportation': 'Transportation',
  'Healthcare': 'Healthcare',
  'Service': 'Services',
  'Bank Fees': 'Fees',
  'Bills': 'Utilities',
  'Travel': 'Travel',
  'Payment': 'Transfer',
  'Deposit': 'Income',
  'Payroll': 'Income',
  'Interest': 'Income',
  
  // Detailed subcategories
  'Restaurants': 'Food & Dining',
  'Fast Food': 'Food & Dining',
  'Coffee Shop': 'Food & Dining',
  'Bar': 'Food & Dining',
  'Groceries': 'Food & Dining',
  'Food Delivery': 'Food & Dining',
  
  'Gas Stations': 'Transportation',
  'Taxi': 'Transportation',
  'Public Transportation': 'Transportation',
  'Ride Share': 'Transportation',
  'Parking': 'Transportation',
  'Tolls': 'Transportation',
  'Auto': 'Transportation',
  'Automotive': 'Transportation',
  
  'Clothing': 'Shopping',
  'Electronics': 'Shopping',
  'General Merchandise': 'Shopping',
  'Department Stores': 'Shopping',
  'Sporting Goods': 'Shopping',
  'Bookstores': 'Shopping',
  'Pet Stores': 'Shopping',
  
  'Entertainment': 'Entertainment',
  'Movies': 'Entertainment',
  'Music': 'Entertainment',
  'Gyms and Fitness Centers': 'Entertainment',
  'Amusement': 'Entertainment',
  'Arts': 'Entertainment',
  'Games': 'Entertainment',
  
  'Medical': 'Healthcare',
  'Dentists': 'Healthcare',
  'Optometrists': 'Healthcare',
  'Pharmacies': 'Healthcare',
  'Hospitals': 'Healthcare',
  'Mental Health': 'Healthcare',
  'Therapy': 'Healthcare',
  
  'Utilities': 'Utilities',
  'Telecommunication Services': 'Utilities',
  'Internet': 'Utilities',
  'Cable': 'Utilities',
  'Phone': 'Utilities',
  'Electric': 'Utilities',
  'Water': 'Utilities',
  'Gas': 'Utilities',
  'Trash': 'Utilities',
  
  'Home Improvement': 'Home',
  'Furniture': 'Home',
  'Hardware': 'Home',
  'Home & Garden': 'Home',
  'Rent': 'Home',
  'Mortgage': 'Home',
  
  'Personal Care': 'Personal Care',
  'Laundry': 'Personal Care',
  'Hair': 'Personal Care',
  'Spa': 'Personal Care',
  
  'Professional Services': 'Services',
  'Legal': 'Services',
  'Accounting': 'Services',
  'Automotive Services': 'Services',
  'Repair': 'Services',
  'Cleaning': 'Services',
  
  'Government': 'Fees',
  'Taxes': 'Fees',
  'Fines': 'Fees',
  'ATM': 'Fees',
  'Bank': 'Fees',
  'Credit Card': 'Fees',
  'Overdraft': 'Fees',
  
  'Hotels': 'Travel',
  'Lodging': 'Travel',
  'Airlines': 'Travel',
  'Car Rental': 'Travel',
  'Travel Insurance': 'Travel',
  'Vacation': 'Travel',
  
  'Education': 'Education',
  'Schools': 'Education',
  'Student Loans': 'Education',
  'Tuition': 'Education',
  'Books': 'Education',
  
  'Charitable Giving': 'Charity',
  'Religious': 'Charity',
  'Donations': 'Charity'
};

// Merchant-based category mapping for better accuracy
const MERCHANT_CATEGORY_MAPPING = {
  // Transportation
  'uber': 'Transportation',
  'lyft': 'Transportation',
  'taxi': 'Transportation',
  'metro': 'Transportation',
  'bus': 'Transportation',
  'train': 'Transportation',
  'subway': 'Transportation',
  'shell': 'Transportation',
  'bp': 'Transportation',
  'exxon': 'Transportation',
  'chevron': 'Transportation',
  'mobil': 'Transportation',
  'citgo': 'Transportation',
  'speedway': 'Transportation',
  'wawa': 'Transportation',
  '7-eleven': 'Transportation',
  'parking': 'Transportation',
  
  // Food & Dining
  'mcdonalds': 'Food & Dining',
  'burger king': 'Food & Dining',
  'kfc': 'Food & Dining',
  'subway': 'Food & Dining',
  'dominos': 'Food & Dining',
  'pizza hut': 'Food & Dining',
  'papa johns': 'Food & Dining',
  'chipotle': 'Food & Dining',
  'panera': 'Food & Dining',
  'starbucks': 'Food & Dining',
  'dunkin': 'Food & Dining',
  'tim hortons': 'Food & Dining',
  'whole foods': 'Food & Dining',
  'kroger': 'Food & Dining',
  'safeway': 'Food & Dining',
  'walmart': 'Food & Dining',
  'target': 'Food & Dining',
  'costco': 'Food & Dining',
  'sams club': 'Food & Dining',
  'trader joes': 'Food & Dining',
  'aldi': 'Food & Dining',
  'publix': 'Food & Dining',
  'wegmans': 'Food & Dining',
  'harris teeter': 'Food & Dining',
  'food lion': 'Food & Dining',
  'giant': 'Food & Dining',
  'stop & shop': 'Food & Dining',
  'king soopers': 'Food & Dining',
  'ralphs': 'Food & Dining',
  'vons': 'Food & Dining',
  'albertsons': 'Food & Dining',
  'meijer': 'Food & Dining',
  'heb': 'Food & Dining',
  'doordash': 'Food & Dining',
  'grubhub': 'Food & Dining',
  'uber eats': 'Food & Dining',
  'postmates': 'Food & Dining',
  
  // Shopping
  'amazon': 'Shopping',
  'ebay': 'Shopping',
  'walmart': 'Shopping',
  'target': 'Shopping',
  'costco': 'Shopping',
  'best buy': 'Shopping',
  'home depot': 'Shopping',
  'lowes': 'Shopping',
  'macys': 'Shopping',
  'nordstrom': 'Shopping',
  'kohls': 'Shopping',
  'jcpenney': 'Shopping',
  'tj maxx': 'Shopping',
  'marshalls': 'Shopping',
  'old navy': 'Shopping',
  'gap': 'Shopping',
  'h&m': 'Shopping',
  'zara': 'Shopping',
  'forever 21': 'Shopping',
  'victorias secret': 'Shopping',
  'bath & body works': 'Shopping',
  'sephora': 'Shopping',
  'ulta': 'Shopping',
  'cvs': 'Shopping',
  'walgreens': 'Shopping',
  'rite aid': 'Shopping',
  
  // Entertainment
  'netflix': 'Entertainment',
  'hulu': 'Entertainment',
  'disney+': 'Entertainment',
  'amazon prime': 'Entertainment',
  'spotify': 'Entertainment',
  'apple music': 'Entertainment',
  'youtube': 'Entertainment',
  'hbo': 'Entertainment',
  'showtime': 'Entertainment',
  'amc': 'Entertainment',
  'regal': 'Entertainment',
  'cinemark': 'Entertainment',
  'planet fitness': 'Entertainment',
  'la fitness': 'Entertainment',
  '24 hour fitness': 'Entertainment',
  'gold\'s gym': 'Entertainment',
  'ymca': 'Entertainment',
  'steam': 'Entertainment',
  'playstation': 'Entertainment',
  'xbox': 'Entertainment',
  'nintendo': 'Entertainment',
  
  // Utilities
  'comcast': 'Utilities',
  'verizon': 'Utilities',
  'att': 'Utilities',
  't-mobile': 'Utilities',
  'sprint': 'Utilities',
  'xfinity': 'Utilities',
  'spectrum': 'Utilities',
  'directv': 'Utilities',
  'dish': 'Utilities',
  'electric': 'Utilities',
  'gas': 'Utilities',
  'water': 'Utilities',
  'internet': 'Utilities',
  'cable': 'Utilities',
  'phone': 'Utilities'
};

// Category colors for consistency
const CATEGORY_COLORS = {
  'Food & Dining': '#FF6B6B',
  'Transportation': '#4ECDC4', 
  'Shopping': '#45B7D1',
  'Entertainment': '#FFA07A',
  'Healthcare': '#98D8C8',
  'Utilities': '#F7DC6F',
  'Travel': '#BB8FCE',
  'Education': '#85C1E9',
  'Personal Care': '#F8C471',
  'Services': '#82E0AA',
  'Fees': '#EC7063',
  'Home': '#D7BDE2',
  'Charity': '#A9DFBF',
  'Income': '#7FB3D3',
  'Transfer': '#D5A6BD',
  'Other': '#BDC3C7'
};

// Enhanced function to determine transaction category (consistent with analyticsController)
function determineTransactionCategory(transaction) {
  const merchantName = transaction.merchant_name || transaction.account_owner || '';
  const transactionName = transaction.name || '';
  
  // 1. First try merchant-based mapping for better accuracy
  if (merchantName) {
    const merchantKey = merchantName.toLowerCase();
    for (const [merchant, category] of Object.entries(MERCHANT_CATEGORY_MAPPING)) {
      if (merchantKey.includes(merchant)) {
        return category;
      }
    }
  }
  
  // 2. Try transaction name-based mapping
  if (transactionName) {
    const nameKey = transactionName.toLowerCase();
    for (const [merchant, category] of Object.entries(MERCHANT_CATEGORY_MAPPING)) {
      if (nameKey.includes(merchant)) {
        return category;
      }
    }
  }
  
  // 3. Use Plaid's detailed category hierarchy
  if (transaction.category && transaction.category.length > 0) {
    // Try detailed categories first (more specific)
    for (let i = transaction.category.length - 1; i >= 0; i--) {
      const categoryName = transaction.category[i];
      if (CATEGORY_MAPPING[categoryName]) {
        return CATEGORY_MAPPING[categoryName];
      }
    }
    
    // If no detailed match, try primary category
    const primaryCategory = transaction.category[0];
    if (CATEGORY_MAPPING[primaryCategory]) {
      return CATEGORY_MAPPING[primaryCategory];
    }
    
    // Return the primary category as-is if no mapping found
    return primaryCategory;
  }
  
  // 4. Special handling for common transaction patterns
  const combinedText = `${merchantName} ${transactionName}`.toLowerCase();
  
  // Transportation patterns
  if (combinedText.match(/\b(taxi|cab|ride|transport|metro|bus|train|parking|toll|gas|fuel|petrol)\b/)) {
    return 'Transportation';
  }
  
  // Food patterns  
  if (combinedText.match(/\b(restaurant|cafe|coffee|pizza|food|lunch|dinner|breakfast|grocery|market)\b/)) {
    return 'Food & Dining';
  }
  
  // Shopping patterns
  if (combinedText.match(/\b(store|shop|retail|mall|purchase|buy|order)\b/)) {
    return 'Shopping';
  }
  
  // Entertainment patterns
  if (combinedText.match(/\b(movie|cinema|game|sport|gym|fitness|entertainment|music|streaming)\b/)) {
    return 'Entertainment';
  }
  
  // Healthcare patterns
  if (combinedText.match(/\b(doctor|hospital|pharmacy|medical|health|dental|clinic)\b/)) {
    return 'Healthcare';
  }
  
  // Utilities patterns
  if (combinedText.match(/\b(electric|water|gas|internet|phone|cable|utility|bill)\b/)) {
    return 'Utilities';
  }
  
  // Banking/Fees patterns
  if (combinedText.match(/\b(fee|charge|atm|bank|interest|penalty|overdraft)\b/)) {
    return 'Fees';
  }
  
  // Default fallback
  return 'Other';
}

// Helper function to get category spending from transactions (consistent with analyticsController)
async function getCategorySpendingFromTransactions(items, dateFilter) {
  const categorySpending = {};
  
  for (const item of items) {
    try {
      let startDate = new Date();
      let endDate = new Date();
      
      if (dateFilter.date) {
        if (dateFilter.date[Op.between]) {
          startDate = dateFilter.date[Op.between][0];
          endDate = dateFilter.date[Op.between][1];
        } else if (dateFilter.date[Op.gte] && dateFilter.date[Op.lte]) {
          startDate = dateFilter.date[Op.gte];
          endDate = dateFilter.date[Op.lte];
        } else if (dateFilter.date[Op.gte]) {
          startDate = dateFilter.date[Op.gte];
          endDate = new Date();
        } else if (dateFilter.date[Op.lte]) {
          // If only end date provided, go back 30 days from end date
          endDate = dateFilter.date[Op.lte];
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
      }

      console.log(`Fetching transactions for item ${item.item_id} from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

      const response = await plaidClient.transactionsGet({
        access_token: item.access_token,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

      const transactions = response.data.transactions;
      console.log(`Found ${transactions.length} transactions for item ${item.item_id}`);

      transactions.forEach(transaction => {
        // Skip positive amounts (deposits/income) for spending analysis
        if (transaction.amount <= 0) return;

        // Enhanced category detection using the same logic as analyticsController
        let category = determineTransactionCategory(transaction);

        // Initialize category if not exists
        if (!categorySpending[category]) {
          categorySpending[category] = {
            category,
            amount: 0,
            count: 0,
            color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other']
          };
        }

        // Add transaction to category (amount is positive, so we negate it for spending)
        categorySpending[category].amount -= transaction.amount;
        categorySpending[category].count += 1;
      });

    } catch (error) {
      console.error(`Error fetching transactions for item ${item.item_id}:`, error);
    }
  }

  // Convert to array and sort by spending amount
  const result = Object.values(categorySpending);
  result.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  
  console.log(`getCategorySpendingFromTransactions result: ${result.length} categories, total spent: ${result.reduce((sum, cat) => sum + Math.abs(cat.amount), 0)}`);
  
  return result;
}

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
