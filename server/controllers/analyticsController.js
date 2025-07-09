// controllers/analyticsController.js
const { Op } = require('sequelize');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const sequelize = require('../config/database');
const User = require('../models/User');
const Item = require('../models/Item');
const Budget = require('../models/Budget');
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

// Enhanced category mapping for transactions
const CATEGORY_MAPPING = {
  // Primary category mappings
  'Food and Drink': 'Food & Dining',
  'Shops': 'Shopping', 
  'Recreation': 'Entertainment',
  'Transportation': 'Transportation',
  'Healthcare': 'Healthcare',
  'Service': 'Services',
  'Bank Fees': 'Fees',
  'Cash Advance': 'Cash',
  'Interest': 'Interest',
  'Payment': 'Payment',
  'Deposit': 'Income',
  'Transfer': 'Transfer',
  'Travel': 'Travel',
  'Bills': 'Utilities',
  
  // Detailed category mappings for better accuracy
  'Restaurants': 'Food & Dining',
  'Fast Food': 'Food & Dining',
  'Coffee Shop': 'Food & Dining',
  'Bar': 'Food & Dining',
  'Food Delivery': 'Food & Dining',
  'Groceries': 'Food & Dining',
  
  'Gas Stations': 'Transportation',
  'Taxi': 'Transportation',
  'Public Transportation': 'Transportation',
  'Parking': 'Transportation',
  'Car Service': 'Transportation',
  'Automotive': 'Transportation',
  'Ride Share': 'Transportation',
  
  'Department Stores': 'Shopping',
  'Supermarkets and Groceries': 'Food & Dining',
  'Clothing and Accessories': 'Shopping',
  'Electronics': 'Shopping',
  'Home and Garden': 'Shopping',
  'Sporting Goods': 'Shopping',
  'Books and Music': 'Shopping',
  'Online Shopping': 'Shopping',
  
  'Movies and DVDs': 'Entertainment',
  'Music and Audio': 'Entertainment',
  'Sporting Events': 'Entertainment',
  'Amusement': 'Entertainment',
  'Arts and Crafts': 'Entertainment',
  'Games': 'Entertainment',
  'Gyms and Fitness Centers': 'Entertainment',
  
  'Internet': 'Utilities',
  'Mobile Phone': 'Utilities',
  'Television': 'Utilities',
  'Utilities': 'Utilities',
  'Electric': 'Utilities',
  'Gas': 'Utilities',
  'Water': 'Utilities',
  'Cable': 'Utilities',
  
  'ATM': 'Fees',
  'Late Fee': 'Fees',
  'Overdraft': 'Fees',
  'Foreign Transaction': 'Fees',
  'Wire Transfer': 'Fees',
  
  'Hotels': 'Travel',
  'Airlines': 'Travel',
  'Car Rental': 'Travel',
  'Travel Agencies': 'Travel',
  
  'Doctors': 'Healthcare',
  'Dentists': 'Healthcare',
  'Eye Care': 'Healthcare',
  'Pharmacy': 'Healthcare',
  'Medical Services': 'Healthcare',
  'Mental Health': 'Healthcare',
  
  'Insurance': 'Services',
  'Professional Services': 'Services',
  'Personal Care': 'Services',
  'Repair and Maintenance': 'Services',
  'Laundry and Dry Cleaning': 'Services'
};

// Merchant-based category mapping for better accuracy
const MERCHANT_CATEGORY_MAPPING = {
  // Transportation
  'uber': 'Transportation',
  'lyft': 'Transportation', 
  'grab': 'Transportation',
  'bolt': 'Transportation',
  'ola': 'Transportation',
  'citymapper': 'Transportation',
  'lime': 'Transportation',
  'bird': 'Transportation',
  'zipcar': 'Transportation',
  'hertz': 'Transportation',
  'enterprise': 'Transportation',
  'shell': 'Transportation',
  'bp': 'Transportation',
  'exxon': 'Transportation',
  'chevron': 'Transportation',
  'mobil': 'Transportation',
  'esso': 'Transportation',
  'texaco': 'Transportation',
  'metro': 'Transportation',
  'mta': 'Transportation',
  'tfl': 'Transportation',
  
  // Food & Dining  
  'mcdonalds': 'Food & Dining',
  'starbucks': 'Food & Dining',
  'dominos': 'Food & Dining',
  'pizza hut': 'Food & Dining',
  'kfc': 'Food & Dining',
  'subway': 'Food & Dining',
  'chipotle': 'Food & Dining',
  'panera': 'Food & Dining',
  'dunkin': 'Food & Dining',
  'taco bell': 'Food & Dining',
  'wendys': 'Food & Dining',
  'burger king': 'Food & Dining',
  'deliveroo': 'Food & Dining',
  'just eat': 'Food & Dining',
  'grubhub': 'Food & Dining',
  'doordash': 'Food & Dining',
  'ubereats': 'Food & Dining',
  'postmates': 'Food & Dining',
  'seamless': 'Food & Dining',
  'instacart': 'Food & Dining',
  'whole foods': 'Food & Dining',
  'trader joes': 'Food & Dining',
  'safeway': 'Food & Dining',
  'kroger': 'Food & Dining',
  'publix': 'Food & Dining',
  'walmart': 'Shopping',
  'target': 'Shopping',
  'costco': 'Shopping',
  'sams club': 'Shopping',
  
  // Entertainment
  'netflix': 'Entertainment',
  'spotify': 'Entertainment',
  'apple music': 'Entertainment',
  'amazon prime': 'Entertainment',
  'disney': 'Entertainment',
  'hulu': 'Entertainment',
  'hbo': 'Entertainment',
  'youtube': 'Entertainment',
  'twitch': 'Entertainment',
  'steam': 'Entertainment',
  'playstation': 'Entertainment',
  'xbox': 'Entertainment',
  'nintendo': 'Entertainment',
  'cinema': 'Entertainment',
  'theater': 'Entertainment',
  'gym': 'Entertainment',
  'fitness': 'Entertainment',
  
  // Shopping
  'amazon': 'Shopping',
  'ebay': 'Shopping',
  'etsy': 'Shopping',
  'best buy': 'Shopping',
  'apple store': 'Shopping',
  'microsoft store': 'Shopping',
  'nike': 'Shopping',
  'adidas': 'Shopping',
  'zara': 'Shopping',
  'h&m': 'Shopping',
  'uniqlo': 'Shopping',
  'macys': 'Shopping',
  'nordstrom': 'Shopping',
  'sephora': 'Shopping',
  'ulta': 'Shopping',
  
  // Utilities
  'verizon': 'Utilities',
  'att': 'Utilities',
  't-mobile': 'Utilities',
  'sprint': 'Utilities',
  'comcast': 'Utilities',
  'spectrum': 'Utilities',
  'cox': 'Utilities',
  'directv': 'Utilities',
  'dish': 'Utilities'
};

// Default category colors
const CATEGORY_COLORS = {
  'Food & Dining': '#FF6B6B',
  'Shopping': '#4ECDC4',
  'Transportation': '#45B7D1',
  'Entertainment': '#96CEB4',
  'Healthcare': '#FECA57',
  'Services': '#54A0FF',
  'Utilities': '#FF9FF3',
  'Travel': '#A55EEA',
  'Fees': '#FD79A8',
  'Income': '#00B894',
  'Transfer': '#FDCB6E',
  'Other': '#6C5CE7'
};

// Get spending analytics by category
exports.getSpendingAnalytics = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { userId } = req.user;
    const { period = 'monthly', startDate, endDate } = req.query;

    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    if (startDate && endDate) {
      dateFilter = {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    } else {
      // Default periods
      let startPeriod;
      switch (period) {
        case 'weekly':
          // Get the start of the current week (Monday)
          const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days
          startPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
          startPeriod.setHours(0, 0, 0, 0); // Start of day
          break;
        case 'yearly':
          startPeriod = new Date(now.getFullYear(), 0, 1);
          break;
        case 'monthly':
        default:
          startPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      dateFilter = {
        date: {
          [Op.gte]: startPeriod,
          [Op.lte]: now
        }
      };
    }

    console.log(`Analytics period: ${period}, dateFilter:`, dateFilter);

    // Get user's items
    const items = await Item.findAll({
      where: { userSub: userId }
    });

    if (items.length === 0) {
      return res.json({
        categorySpending: [],
        totalSpending: 0,
        transactionCount: 0,
        averageTransaction: 0
      });
    }

    // Fetch real transaction data from Plaid
    let categorySpending = await getCategorySpendingFromTransactions(items, dateFilter);
    
    // If no real data available, return empty data
    if (categorySpending.length === 0) {
      console.log('No transaction data found for this period');
    }
    
    const totalSpending = categorySpending.reduce((sum, cat) => sum + cat.amount, 0);
    const transactionCount = categorySpending.reduce((sum, cat) => sum + cat.count, 0);
    const averageTransaction = transactionCount > 0 ? totalSpending / transactionCount : 0;

    res.json({
      categorySpending,
      totalSpending: Math.abs(totalSpending),
      transactionCount,
      averageTransaction: Math.abs(averageTransaction),
      period,
      dateRange: dateFilter.date
    });

  } catch (error) {
    console.error('Error fetching spending analytics:', error);
    res.status(500).json({ error: 'Failed to fetch spending analytics' });
  }
};

// Get spending comparison (current vs previous period)
exports.getSpendingComparison = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { userId } = req.user;
    const { period = 'monthly' } = req.query;

    const now = new Date();
    let currentStart, currentEnd, previousStart, previousEnd;

    switch (period) {
      case 'weekly':
        // Get the start of the current week (Monday)
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
        currentStart.setHours(0, 0, 0, 0); // Start of day
        currentEnd = now;
        // Previous week is 7 days before current week start
        previousStart = new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEnd = new Date(currentStart.getTime() - 1); // End of previous week
        break;
      case 'yearly':
        currentStart = new Date(now.getFullYear(), 0, 1);
        currentEnd = now;
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        previousEnd = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case 'monthly':
      default:
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentEnd = now;
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    console.log(`Spending comparison - ${period}:`);
    console.log(`Current period: ${currentStart.toISOString().split('T')[0]} to ${currentEnd.toISOString().split('T')[0]}`);
    console.log(`Previous period: ${previousStart.toISOString().split('T')[0]} to ${previousEnd.toISOString().split('T')[0]}`);

    const items = await Item.findAll({ where: { userSub: userId } });

    if (items.length === 0) {
      return res.json({
        current: { total: 0, categories: [] },
        previous: { total: 0, categories: [] },
        change: { total: 0, percentage: 0 },
        insights: []
      });
    }

    // Get spending for both periods
    let currentSpending = await getCategorySpendingFromTransactions(items, {
      date: { [Op.between]: [currentStart, currentEnd] }
    });

    let previousSpending = await getCategorySpendingFromTransactions(items, {
      date: { [Op.between]: [previousStart, previousEnd] }
    });

    // No demo data fallback - show real data only
    if (currentSpending.length === 0) {
      console.log('No current period transaction data found');
    }
    if (previousSpending.length === 0) {
      console.log('No previous period transaction data found');
    }

    // Ensure we have all categories from both periods for better comparison
    const allCategories = new Set();
    const categoryMap = {};
    
    // Collect all unique categories
    currentSpending.forEach(cat => {
      allCategories.add(cat.category);
      categoryMap[cat.category] = { current: cat, previous: null };
    });
    
    previousSpending.forEach(cat => {
      allCategories.add(cat.category);
      if (categoryMap[cat.category]) {
        categoryMap[cat.category].previous = cat;
      } else {
        categoryMap[cat.category] = { current: null, previous: cat };
      }
    });
    
    // Fill in missing categories with zero amounts
    const completeCurrentSpending = [];
    const completePreviousSpending = [];
    
    Array.from(allCategories).forEach(category => {
      const data = categoryMap[category];
      
      // Current period
      if (data.current) {
        completeCurrentSpending.push(data.current);
      } else {
        completeCurrentSpending.push({
          category,
          amount: 0,
          count: 0,
          color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other']
        });
      }
      
      // Previous period
      if (data.previous) {
        completePreviousSpending.push(data.previous);
      } else {
        completePreviousSpending.push({
          category,
          amount: 0,
          count: 0,
          color: CATEGORY_COLORS[category] || CATEGORY_COLORS['Other']
        });
      }
    });

    const currentTotal = Math.abs(completeCurrentSpending.reduce((sum, cat) => sum + cat.amount, 0));
    const previousTotal = Math.abs(completePreviousSpending.reduce((sum, cat) => sum + cat.amount, 0));

    const changeAmount = currentTotal - previousTotal;
    const changePercentage = previousTotal > 0 ? (changeAmount / previousTotal) * 100 : 0;

    // Generate insights
    const insights = generateSpendingInsights(completeCurrentSpending, completePreviousSpending, changeAmount, changePercentage);

    res.json({
      current: { 
        total: currentTotal, 
        categories: completeCurrentSpending,
        period: `${currentStart.toISOString().split('T')[0]} to ${currentEnd.toISOString().split('T')[0]}`
      },
      previous: { 
        total: previousTotal, 
        categories: completePreviousSpending,
        period: `${previousStart.toISOString().split('T')[0]} to ${previousEnd.toISOString().split('T')[0]}`
      },
      change: { 
        total: changeAmount, 
        percentage: changePercentage 
      },
      insights
    });

  } catch (error) {
    console.error('Error fetching spending comparison:', error);
    res.status(500).json({ error: 'Failed to fetch spending comparison' });
  }
};

// Get budget vs actual spending
exports.getBudgetAnalysis = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { userId } = req.user;
    const now = new Date();

    // Get active budgets
    const budgets = await Budget.findAll({
      where: {
        userSub: userId,
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now }
      }
    });

    if (budgets.length === 0) {
      return res.json({
        budgets: [],
        totalBudget: 0,
        totalSpent: 0,
        overallUsage: 0,
        alerts: []
      });
    }

    // Get current spending for budget categories
    const items = await Item.findAll({ where: { userSub: userId } });
    let currentSpending = await getCategorySpendingFromTransactions(items, {
      date: {
        [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1),
        [Op.lte]: now
      }
    });

    // No demo data fallback - show real data only
    if (currentSpending.length === 0) {
      console.log('No transaction data found for budget analysis');
    }

    console.log('Current spending categories:', currentSpending.map(s => s.category));
    console.log('Budget categories:', budgets.map(b => b.category));

    // Match spending to budgets and update current spent
    const budgetAnalysis = [];
    const alerts = [];

    for (const budget of budgets) {
      console.log(`Looking for spending category matching budget: "${budget.category}"`);
      
      const categorySpending = currentSpending.find(
        spending => {
          const match = spending.category.toLowerCase() === budget.category.toLowerCase();
          console.log(`  Comparing "${spending.category}" with "${budget.category}": ${match}`);
          return match;
        }
      );
      
      const actualSpent = categorySpending ? Math.abs(categorySpending.amount) : 0;
      
      console.log(`Budget "${budget.category}": Found spending = ${actualSpent}, Category data:`, categorySpending);
      
      // Update budget's current spent
      await budget.update({ currentSpent: actualSpent });

      const analysis = {
        id: budget.id,
        category: budget.category,
        budgetAmount: parseFloat(budget.budgetAmount),
        currentSpent: actualSpent,
        remaining: budget.getRemainingAmount(),
        usagePercentage: budget.getUsagePercentage(),
        isOverBudget: budget.isOverBudget(),
        isNearLimit: budget.isNearLimit(),
        period: budget.period,
        alertThreshold: parseFloat(budget.alertThreshold)
      };

      budgetAnalysis.push(analysis);

      // Generate alerts
      if (analysis.isOverBudget) {
        alerts.push({
          type: 'error',
          category: budget.category,
          message: `You've exceeded your ${budget.category} budget by $${(actualSpent - analysis.budgetAmount).toFixed(2)}`
        });
      } else if (analysis.isNearLimit) {
        alerts.push({
          type: 'warning',
          category: budget.category,
          message: `You've used ${(analysis.usagePercentage * 100).toFixed(0)}% of your ${budget.category} budget`
        });
      }
    }

    const totalBudget = budgetAnalysis.reduce((sum, b) => sum + b.budgetAmount, 0);
    const totalSpent = budgetAnalysis.reduce((sum, b) => sum + b.currentSpent, 0);
    const overallUsage = totalBudget > 0 ? (totalSpent / totalBudget) : 0;

    res.json({
      budgets: budgetAnalysis,
      totalBudget,
      totalSpent,
      overallUsage,
      alerts
    });

  } catch (error) {
    console.error('Error fetching budget analysis:', error);
    res.status(500).json({ error: 'Failed to fetch budget analysis' });
  }
};

// Helper function to fetch and categorize real Plaid transactions
async function getCategorySpendingFromTransactions(items, dateFilter) {
  const categorySpending = {};
  
  // Fetch transactions for each item
  for (const item of items) {
    try {
      // Calculate date range for Plaid API
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

      // Fetch transactions from Plaid
      const response = await plaidClient.transactionsGet({
        access_token: item.access_token,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

      const transactions = response.data.transactions;
      console.log(`Found ${transactions.length} transactions for item ${item.item_id}`);

      // Process transactions and categorize with enhanced logic
      transactions.forEach(transaction => {
        // Skip positive amounts (deposits/income) for spending analysis
        if (transaction.amount <= 0) return;

        // Enhanced category detection
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
      // Continue with other items if one fails
    }
  }

  // Convert to array and sort by spending amount
  const result = Object.values(categorySpending);
  result.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  
  console.log(`getCategorySpendingFromTransactions result: ${result.length} categories, total spent: ${result.reduce((sum, cat) => sum + Math.abs(cat.amount), 0)}`);
  
  return result;
}

// Helper function to generate spending insights
function generateSpendingInsights(currentSpending, previousSpending, changeAmount, changePercentage) {
  const insights = [];

  // Overall spending trend
  if (Math.abs(changePercentage) > 5) {
    if (changeAmount > 0) {
      insights.push({
        type: 'warning',
        title: 'Increased Spending',
        message: `Your spending increased by ${Math.abs(changePercentage).toFixed(1)}% compared to last period`,
        icon: '📈'
      });
    } else {
      insights.push({
        type: 'success',
        title: 'Reduced Spending',
        message: `Great job! You reduced spending by ${Math.abs(changePercentage).toFixed(1)}% compared to last period`,
        icon: '📉'
      });
    }
  }

  // Category-specific insights
  currentSpending.forEach(current => {
    const previous = previousSpending.find(p => p.category === current.category);
    if (previous) {
      const categoryChange = ((Math.abs(current.amount) - Math.abs(previous.amount)) / Math.abs(previous.amount)) * 100;
      
      if (categoryChange > 25) {
        insights.push({
          type: 'info',
          title: `${current.category} Spending Up`,
          message: `${current.category} spending increased by ${categoryChange.toFixed(0)}% this period`,
          icon: '🔍'
        });
      }
    }
  });

  // Spending pattern insights
  const topCategories = currentSpending
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 3);

  if (topCategories.length > 0) {
    insights.push({
      type: 'info',
      title: 'Top Spending Categories',
      message: `Your top spending categories are: ${topCategories.map(c => c.category).join(', ')}`,
      icon: '💡'
    });
  }

  return insights;
}

// Enhanced function to determine transaction category
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

// Export the helper function for use in other controllers
exports.getCategorySpendingFromTransactions = getCategorySpendingFromTransactions;

module.exports = exports;
