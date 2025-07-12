# AI Finance WebApp - Server Directory

## 🎯 What is this?
This is the **backend** of our AI Finance WebApp. Think of it as the "brain" behind the scenes - it handles all the data processing, connects to banks through Plaid, manages user authentication, stores information in the database, and provides all the financial calculations. The server is what makes everything work!

## 🔧 What does a Backend/Server do?
- **Processes requests** from the frontend (like "get my bank accounts")
- **Connects to external services** (Plaid API for bank data)
- **Manages the database** (stores user data, transactions, budgets)
- **Handles authentication** (makes sure users are who they say they are)
- **Performs calculations** (spending analytics, budget tracking, insights)
- **Provides security** (protects sensitive financial data)

## 📁 Project Structure Overview

```
server/
├── 📄 server.js                    # Main server file (the heart of our backend)
├── 📄 package.json                 # Project information and dependencies
├── 📄 package-lock.json            # Exact versions of installed packages
├── 📄 .gitignore                   # Files to ignore in version control
├── 📄 README.md                    # This documentation file
├── 📁 config/
│   └── 📄 database.js              # Database connection configuration
├── 📁 controllers/
│   ├── 📄 analyticsController.js   # Handles spending analysis and insights
│   ├── 📄 budgetController.js      # Manages budget creation and tracking
│   └── 📄 plaidController.js       # Handles bank connections via Plaid
├── 📁 middleware/
│   └── 📄 authMiddleware.js        # Authentication and security checks
├── 📁 models/
│   ├── 📄 Budget.js                # Budget database structure
│   ├── 📄 Item.js                  # Plaid item (bank connection) structure
│   └── 📄 User.js                  # User database structure
└── 📁 routes/
    ├── 📄 analyticsRoutes.js       # URL paths for analytics features
    ├── 📄 budgetRoutes.js          # URL paths for budget features
    └── 📄 plaidRoutes.js           # URL paths for bank connection features
```

---

## 📄 File-by-File Explanation

### 🟢 Main Server File

#### `server.js` - The Heart of Our Backend
**What it does:** This is the main file that starts our server and connects everything together.

```javascript
// Import required libraries (like ingredients for a recipe)
const express = require('express');        // Web framework for Node.js
const cors = require('cors');              // Allows frontend to talk to backend
const dotenv = require('dotenv');          // Loads environment variables
const sequelize = require('./config/database'); // Database connection

// Import our route handlers (like different departments in a company)
const plaidRoutes = require('./routes/plaidRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

// Load environment variables from .env file
dotenv.config();

// Create the Express application (like opening a restaurant)
const app = express();

// Middleware setup (like setting rules for the restaurant)
app.use(cors({
  origin: 'http://localhost:5173', // Only allow requests from our frontend
  credentials: true                // Allow cookies to be sent
}));

app.use(express.json()); // Parse JSON data from requests

// Route handlers (like different menus in a restaurant)
app.use('/plaid', plaidRoutes);           // Handle bank-related requests
app.use('/analytics', analyticsRoutes);   // Handle analytics requests
app.use('/budget', budgetRoutes);         // Handle budget requests

// Health check endpoint (like asking "is the server running?")
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start the server (like opening the restaurant doors)
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Connect to database (like setting up the cash register)
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Create tables if they don't exist (like setting up the restaurant)
    await sequelize.sync({ alter: true });
    console.log('Database tables synced');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
});
```

**Key concepts explained:**
- **Express.js**: A framework that makes it easy to create web servers
- **Middleware**: Functions that run before your main code (like security checks)
- **Routes**: Different URL paths that handle different types of requests
- **Port**: A "door" on your computer where the server listens for requests
- **Database sync**: Making sure database tables match your code structure

---

### 📄 `package.json` - Project Blueprint
**What it does:** This file tells Node.js what our project is and what libraries it needs.

```json
{
  "name": "server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",           // Start the server in production
    "dev": "nodemon server.js",          // Start with auto-restart for development
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    // Core server libraries
    "express": "^4.18.2",               // Web framework
    "cors": "^2.8.5",                   // Cross-origin resource sharing
    "dotenv": "^16.3.1",                // Environment variable loader
    
    // Database libraries
    "sequelize": "^6.32.1",             // Object-Relational Mapping (ORM)
    "pg": "^8.11.3",                    // PostgreSQL database driver
    "pg-hstore": "^2.3.4",              // PostgreSQL data type support
    
    // Authentication & Security
    "jsonwebtoken": "^9.0.2",           // JWT token handling
    "jwks-rsa": "^3.0.1",               // Public key retrieval for JWT
    
    // External API Integration
    "plaid": "^13.0.0",                 // Plaid API for bank connections
    
    // PDF Generation
    "pdfkit": "^0.15.0"                 // Generate PDF documents
  },
  "devDependencies": {
    "nodemon": "^3.0.1"                 // Auto-restart server during development
  }
}
```

**What each dependency does:**
- **express**: Like a waiter that takes orders (HTTP requests) and serves responses
- **cors**: Like a security guard that allows our frontend to talk to backend
- **dotenv**: Loads secret configuration from `.env` file
- **sequelize**: Translates JavaScript objects to database queries
- **pg**: Connects to PostgreSQL database
- **jsonwebtoken**: Creates and verifies secure user tokens
- **plaid**: Official library to connect to Plaid's banking API
- **pdfkit**: Creates PDF files (like bank statements)

---

### 📁 config/ Directory - Configuration Files

#### `database.js` - Database Connection Setup
**What it does:** Configures how our server connects to the PostgreSQL database.

```javascript
// Import Sequelize (our database toolkit)
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create database connection (like getting a phone line to the bank)
const sequelize = new Sequelize(
  process.env.DB_NAME || 'finance_app',     // Database name
  process.env.DB_USER || 'postgres',        // Username
  process.env.DB_PASSWORD || 'password',    // Password
  {
    host: process.env.DB_HOST || 'localhost', // Where database is located
    port: process.env.DB_PORT || 5432,        // Database port
    dialect: 'postgres',                      // Type of database
    
    // Connection pool settings (like managing multiple phone lines)
    pool: {
      max: 5,          // Maximum number of connections
      min: 0,          // Minimum number of connections
      acquire: 30000,  // Time to wait for connection (30 seconds)
      idle: 10000      // Time before closing idle connection (10 seconds)
    },
    
    // Logging settings
    logging: false,    // Don't log SQL queries (set to console.log to see them)
    
    // Timezone settings
    timezone: '+00:00' // Use UTC timezone
  }
);

// Test the connection (like checking if the phone line works)
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
  }
};

// Export the connection so other files can use it
module.exports = sequelize;
```

**Key concepts:**
- **Sequelize**: An ORM (Object-Relational Mapping) tool that lets us use JavaScript objects instead of SQL
- **Connection Pool**: Manages multiple database connections efficiently
- **Environment Variables**: Secret configuration stored in `.env` file
- **PostgreSQL**: A powerful, open-source database system

---

### 📁 models/ Directory - Database Structure

#### `User.js` - User Database Model
**What it does:** Defines the structure for storing user information in the database.

```javascript
// Import Sequelize components
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define User model (like creating a form template)
const User = sequelize.define('User', {
  // User ID from AWS Cognito (unique identifier)
  sub: {
    type: DataTypes.STRING,        // Text field
    allowNull: false,              // This field is required
    primaryKey: true,              // This is the main identifier
    unique: true                   // No two users can have the same sub
  },
  
  // User's email address
  email: {
    type: DataTypes.STRING,        // Text field
    allowNull: false,              // This field is required
    unique: true,                  // Each email can only be used once
    validate: {
      isEmail: true                // Must be a valid email format
    }
  },
  
  // User's display name (optional)
  name: {
    type: DataTypes.STRING,        // Text field
    allowNull: true                // This field is optional
  },
  
  // When the user was created
  createdAt: {
    type: DataTypes.DATE,          // Date and time field
    defaultValue: DataTypes.NOW    // Automatically set to current time
  },
  
  // When the user was last updated
  updatedAt: {
    type: DataTypes.DATE,          // Date and time field
    defaultValue: DataTypes.NOW    // Automatically updated when record changes
  }
}, {
  // Model options
  tableName: 'users',              // Name of the database table
  timestamps: true                 // Automatically manage createdAt and updatedAt
});

// Export the model so other files can use it
module.exports = User;
```

**Key concepts:**
- **Model**: A blueprint for data structure (like a template)
- **DataTypes**: Specifies what kind of data each field can hold
- **Validation**: Rules to ensure data quality
- **Primary Key**: The unique identifier for each record
- **Timestamps**: Automatically track when records are created/updated

#### `Item.js` - Bank Connection Model
**What it does:** Stores information about connected bank accounts (Plaid items).

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

// Define Item model (represents a bank connection)
const Item = sequelize.define('Item', {
  // Plaid's unique identifier for this bank connection
  item_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true                   // Each item_id is unique
  },
  
  // Access token to communicate with this bank
  access_token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Which user this bank connection belongs to
  userSub: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User,                 // References the User model
      key: 'sub'                   // Links to the 'sub' field in User
    }
  },
  
  // Bank institution information (optional)
  institution_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  institution_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Connection status
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'error'),
    defaultValue: 'active'
  }
}, {
  tableName: 'items',
  timestamps: true
});

// Define relationships (like family connections)
Item.belongsTo(User, { 
  foreignKey: 'userSub',           // The field that links to User
  targetKey: 'sub'                 // The field in User it links to
});

User.hasMany(Item, { 
  foreignKey: 'userSub',           // Users can have multiple bank connections
  sourceKey: 'sub'
});

module.exports = Item;
```

**Key concepts:**
- **Foreign Key**: Links records between different tables
- **Relationships**: Defines how tables connect to each other
- **ENUM**: A field that can only have specific values
- **belongsTo/hasMany**: Defines one-to-many relationships

#### `Budget.js` - Budget Tracking Model
**What it does:** Stores user budgets and spending limits.

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

// Define Budget model
const Budget = sequelize.define('Budget', {
  // Auto-incrementing ID
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Which user this budget belongs to
  userSub: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User,
      key: 'sub'
    }
  },
  
  // Budget category (e.g., "Food & Dining", "Transportation")
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Monthly spending limit
  limit: {
    type: DataTypes.DECIMAL(10, 2),  // Up to 10 digits, 2 decimal places
    allowNull: false,
    validate: {
      min: 0                         // Must be positive
    }
  },
  
  // How much has been spent this month
  spent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  
  // Budget period (month/year this budget applies to)
  period: {
    type: DataTypes.STRING,          // Format: "2024-01" for January 2024
    allowNull: false
  },
  
  // Whether this budget is active
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'budgets',
  timestamps: true,
  
  // Ensure one budget per category per period per user
  indexes: [
    {
      unique: true,
      fields: ['userSub', 'category', 'period']
    }
  ]
});

// Define relationship
Budget.belongsTo(User, { 
  foreignKey: 'userSub',
  targetKey: 'sub'
});

User.hasMany(Budget, { 
  foreignKey: 'userSub',
  sourceKey: 'sub'
});

module.exports = Budget;
```

**Key concepts:**
- **DECIMAL**: Precise decimal numbers for money calculations
- **Validation**: Rules to ensure data makes sense
- **Indexes**: Speed up database queries and enforce uniqueness
- **Composite Index**: Ensures uniqueness across multiple fields

---

### 📁 middleware/ Directory - Security & Processing

#### `authMiddleware.js` - Authentication Guardian
**What it does:** Acts like a security guard, checking if users are authorized before letting them access protected data.

```javascript
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Create a client to get public keys from AWS Cognito
const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`
});

// Function to get the signing key for JWT verification
const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('Error getting signing key:', err);
      return callback(err);
    }
    
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

// Main authentication middleware function
const verifyToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  
  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'No authorization header provided' 
    });
  }
  
  // Extract the token (format: "Bearer <token>")
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'No token provided' 
    });
  }
  
  // Verify the token
  jwt.verify(token, getKey, {
    audience: process.env.COGNITO_CLIENT_ID,      // Who the token is for
    issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
    algorithms: ['RS256']                          // Encryption algorithm
  }, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(403).json({ 
        error: 'Token verification failed' 
      });
    }
    
    // If token is valid, add user info to request
    req.user = decoded;
    next(); // Continue to the next middleware or route handler
  });
};

// Export the middleware function
module.exports = {
  verifyToken
};
```

**Key concepts:**
- **JWT (JSON Web Token)**: A secure way to transmit user information
- **Middleware**: Functions that run before your main route handlers
- **Public Key Cryptography**: Uses mathematical keys to verify token authenticity
- **Authorization Header**: Where the client sends the authentication token
- **next()**: Passes control to the next function in the chain

---

### 📁 controllers/ Directory - Business Logic

#### `plaidController.js` - Bank Connection Handler
**What it does:** Manages all interactions with Plaid API for bank connections and data retrieval.

```javascript
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const dotenv = require('dotenv');
const Item = require('../models/Item');
const User = require('../models/User');

dotenv.config();

// Configure Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV], // sandbox, development, or production
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Function to create a link token (starts bank connection process)
const createLinkToken = async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: req.user.sub,  // Use authenticated user's ID
      },
      client_name: 'AI Finance WebApp',
      products: ['auth', 'transactions'], // What data we want access to
      country_codes: ['US'],              // Which countries
      language: 'en',                     // Language
    });
    
    res.json(response.data);
  } catch (err) {
    console.error('Error creating link token:', err);
    res.status(500).json({ error: 'Failed to create link token' });
  }
};

// Function to exchange public token for access token
const exchangePublicToken = async (req, res) => {
  try {
    const { public_token } = req.body;
    
    // Exchange public token for access token
    const response = await plaidClient.itemPublicTokenExchange({ 
      public_token 
    });
    
    const { access_token, item_id } = response.data;
    
    // Store or update user in database
    await User.findOrCreate({
      where: { sub: req.user.sub },
      defaults: { 
        email: req.user.email,
        name: req.user.name 
      },
    });
    
    // Store the item (bank connection) in database
    await Item.create({
      item_id,
      access_token,
      userSub: req.user.sub,
    });
    
    res.json({ 
      success: true, 
      message: 'Bank account connected successfully' 
    });
  } catch (err) {
    console.error('Error exchanging public token:', err);
    res.status(500).json({ error: 'Failed to connect bank account' });
  }
};

// Function to get user's bank accounts
const getAccounts = async (req, res) => {
  try {
    const userSub = req.user.sub;
    
    // Find user's bank connection
    const item = await Item.findOne({ where: { userSub } });
    if (!item) {
      return res.status(404).json({ message: 'No bank account connected' });
    }
    
    // Get account information from Plaid
    const response = await plaidClient.accountsBalanceGet({ 
      access_token: item.access_token 
    });
    
    res.json({ accounts: response.data.accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ 
      message: 'Failed to fetch accounts', 
      error: error.message 
    });
  }
};

// Function to get user's transactions
const getTransactions = async (req, res) => {
  try {
    const userSub = req.user.sub;
    
    // Find user's bank connection
    const item = await Item.findOne({ where: { userSub } });
    if (!item) {
      return res.status(404).json({ message: 'No bank account connected' });
    }
    
    // Get transactions from Plaid
    const response = await plaidClient.transactionsSync({
      access_token: item.access_token,
      cursor: '',     // Start from beginning
      count: 100,     // Limit number of transactions
    });
    
    res.json({
      transactions: response.data.added,
      accounts: response.data.accounts,
      total_transactions: response.data.added.length,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      message: 'Failed to fetch transactions', 
      error: error.message 
    });
  }
};

// Export all functions
module.exports = {
  createLinkToken,
  exchangePublicToken,
  getAccounts,
  getTransactions
};
```

**Key concepts:**
- **API Client**: A tool to communicate with external services (Plaid)
- **Access Token**: A key that allows us to access user's bank data
- **Public Token**: A temporary token that gets exchanged for access token
- **Environment Variables**: Secret keys stored in `.env` file
- **Error Handling**: Proper responses when things go wrong

#### `analyticsController.js` - Financial Analytics Engine
**What it does:** Analyzes spending patterns and provides financial insights.

```javascript
const { Op } = require('sequelize');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const Item = require('../models/Item');
const User = require('../models/User');
const Budget = require('../models/Budget');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Plaid client (same as plaidController)
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

// Category mapping for better transaction categorization
const CATEGORY_MAPPING = {
  'Food and Drink': 'Food & Dining',
  'Shops': 'Shopping',
  'Recreation': 'Entertainment',
  'Transportation': 'Transportation',
  'Healthcare': 'Healthcare',
  'Service': 'Services',
  'Bank Fees': 'Fees',
  'Transfer': 'Transfer',
  'Deposit': 'Income',
  // Add more mappings as needed
};

// Function to map transaction categories to our standard categories
const mapCategory = (plaidCategories, merchantName) => {
  if (!plaidCategories || plaidCategories.length === 0) {
    return 'Other';
  }
  
  const primaryCategory = plaidCategories[0];
  
  // Check if we have a mapping for this category
  if (CATEGORY_MAPPING[primaryCategory]) {
    return CATEGORY_MAPPING[primaryCategory];
  }
  
  // Use merchant name for better categorization
  if (merchantName) {
    const merchant = merchantName.toLowerCase();
    if (merchant.includes('restaurant') || merchant.includes('cafe')) {
      return 'Food & Dining';
    }
    if (merchant.includes('gas') || merchant.includes('fuel')) {
      return 'Transportation';
    }
    // Add more merchant-based logic
  }
  
  return primaryCategory || 'Other';
};

// Function to get spending analytics
const getSpendingAnalytics = async (req, res) => {
  try {
    const userSub = req.user.sub;
    const { period = 'month' } = req.query; // Default to current month
    
    // Find user's bank connection
    const item = await Item.findOne({ where: { userSub } });
    if (!item) {
      return res.status(404).json({ message: 'No bank account connected' });
    }
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    // Get transactions from Plaid
    const response = await plaidClient.transactionsSync({
      access_token: item.access_token,
      cursor: '',
      count: 500, // Get more transactions for better analysis
    });
    
    const transactions = response.data.added;
    
    // Filter transactions by date and positive amounts (expenses)
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && 
             transactionDate <= now && 
             transaction.amount > 0; // Positive amounts are expenses
    });
    
    // Group transactions by category
    const categorySpending = {};
    filteredTransactions.forEach(transaction => {
      const category = mapCategory(transaction.category, transaction.merchant_name);
      
      if (!categorySpending[category]) {
        categorySpending[category] = {
          category,
          amount: 0,
          count: 0,
          transactions: []
        };
      }
      
      categorySpending[category].amount += transaction.amount;
      categorySpending[category].count += 1;
      categorySpending[category].transactions.push(transaction);
    });
    
    // Convert to array and sort by spending amount
    const categoryArray = Object.values(categorySpending)
      .sort((a, b) => b.amount - a.amount);
    
    // Calculate total spending
    const totalSpending = categoryArray.reduce((sum, cat) => sum + cat.amount, 0);
    
    // Get top spending categories
    const topCategories = categoryArray.slice(0, 5);
    
    res.json({
      period,
      totalSpending,
      categorySpending: categoryArray,
      topCategories,
      transactionCount: filteredTransactions.length,
      averageTransactionAmount: totalSpending / filteredTransactions.length || 0
    });
    
  } catch (error) {
    console.error('Error getting spending analytics:', error);
    res.status(500).json({ 
      message: 'Failed to get spending analytics', 
      error: error.message 
    });
  }
};

// Function to get financial insights
const getInsights = async (req, res) => {
  try {
    const userSub = req.user.sub;
    
    // Find user's bank connection
    const item = await Item.findOne({ where: { userSub } });
    if (!item) {
      return res.status(404).json({ message: 'No bank account connected' });
    }
    
    // Get recent transactions
    const response = await plaidClient.transactionsSync({
      access_token: item.access_token,
      cursor: '',
      count: 200,
    });
    
    const transactions = response.data.added;
    
    // Analyze spending patterns
    const insights = [];
    
    // Calculate current month vs previous month spending
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const currentMonthSpending = transactions
      .filter(t => new Date(t.date) >= currentMonthStart && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const previousMonthSpending = transactions
      .filter(t => {
        const date = new Date(t.date);
        return date >= previousMonthStart && date <= previousMonthEnd && t.amount > 0;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Generate insights based on spending patterns
    if (currentMonthSpending > previousMonthSpending * 1.2) {
      insights.push({
        type: 'warning',
        title: 'High Spending Alert',
        message: `Your spending this month is ${((currentMonthSpending / previousMonthSpending - 1) * 100).toFixed(1)}% higher than last month.`,
        amount: currentMonthSpending - previousMonthSpending
      });
    } else if (currentMonthSpending < previousMonthSpending * 0.8) {
      insights.push({
        type: 'positive',
        title: 'Great Savings!',
        message: `You've saved ${((1 - currentMonthSpending / previousMonthSpending) * 100).toFixed(1)}% compared to last month.`,
        amount: previousMonthSpending - currentMonthSpending
      });
    }
    
    // Check for unusual spending patterns
    const categories = {};
    transactions.forEach(transaction => {
      if (transaction.amount > 0) {
        const category = mapCategory(transaction.category, transaction.merchant_name);
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(transaction.amount);
      }
    });
    
    // Find categories with high spending
    Object.entries(categories).forEach(([category, amounts]) => {
      const total = amounts.reduce((sum, amount) => sum + amount, 0);
      const average = total / amounts.length;
      
      if (total > 500 && amounts.length > 3) { // Arbitrary thresholds
        insights.push({
          type: 'info',
          title: `${category} Spending`,
          message: `You've spent $${total.toFixed(2)} on ${category} with an average of $${average.toFixed(2)} per transaction.`,
          category,
          amount: total
        });
      }
    });
    
    res.json({
      insights,
      currentMonthSpending,
      previousMonthSpending,
      spendingChange: currentMonthSpending - previousMonthSpending,
      spendingChangePercent: previousMonthSpending > 0 ? 
        ((currentMonthSpending / previousMonthSpending - 1) * 100) : 0
    });
    
  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json({ 
      message: 'Failed to get insights', 
      error: error.message 
    });
  }
};

// Export functions
module.exports = {
  getSpendingAnalytics,
  getInsights
};
```

**Key concepts:**
- **Data Analysis**: Processing transaction data to find patterns
- **Category Mapping**: Converting bank categories to our standard categories
- **Date Filtering**: Selecting transactions within specific time ranges
- **Aggregation**: Grouping and summing data by category
- **Insights Generation**: Creating meaningful observations from data

#### `budgetController.js` - Budget Management System
**What it does:** Manages budget creation, tracking, and monitoring.

```javascript
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

// Function to create a new budget
const createBudget = async (req, res) => {
  try {
    const { category, limit, period } = req.body;
    const userSub = req.user.sub;
    
    // Validate input
    if (!category || !limit || !period) {
      return res.status(400).json({ 
        error: 'Category, limit, and period are required' 
      });
    }
    
    if (limit <= 0) {
      return res.status(400).json({ 
        error: 'Budget limit must be positive' 
      });
    }
    
    // Check if budget already exists for this category and period
    const existingBudget = await Budget.findOne({
      where: {
        userSub,
        category,
        period
      }
    });
    
    if (existingBudget) {
      return res.status(400).json({ 
        error: 'Budget already exists for this category and period' 
      });
    }
    
    // Create new budget
    const budget = await Budget.create({
      userSub,
      category,
      limit: parseFloat(limit),
      period,
      spent: 0.00,
      active: true
    });
    
    res.status(201).json({
      message: 'Budget created successfully',
      budget
    });
    
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ 
      message: 'Failed to create budget', 
      error: error.message 
    });
  }
};

// Function to get user's budgets
const getBudgets = async (req, res) => {
  try {
    const userSub = req.user.sub;
    const { period } = req.query;
    
    // Build query conditions
    const whereConditions = { userSub };
    if (period) {
      whereConditions.period = period;
    }
    
    // Get budgets from database
    const budgets = await Budget.findAll({
      where: whereConditions,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      budgets,
      count: budgets.length
    });
    
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ 
      message: 'Failed to fetch budgets', 
      error: error.message 
    });
  }
};

// Function to update budget spending (called when new transactions are processed)
const updateBudgetSpending = async (req, res) => {
  try {
    const userSub = req.user.sub;
    const { period } = req.body;
    
    // Get current period if not provided
    const currentPeriod = period || new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    
    // Find user's bank connection
    const item = await Item.findOne({ where: { userSub } });
    if (!item) {
      return res.status(404).json({ message: 'No bank account connected' });
    }
    
    // Get transactions from Plaid
    const response = await plaidClient.transactionsSync({
      access_token: item.access_token,
      cursor: '',
      count: 500,
    });
    
    const transactions = response.data.added;
    
    // Filter transactions for the current period
    const [year, month] = currentPeriod.split('-');
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const periodTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && 
             transactionDate <= endDate && 
             transaction.amount > 0; // Only expenses
    });
    
    // Get user's budgets for this period
    const budgets = await Budget.findAll({
      where: {
        userSub,
        period: currentPeriod
      }
    });
    
    // Calculate spending by category
    const categorySpending = {};
    periodTransactions.forEach(transaction => {
      const category = mapCategory(transaction.category, transaction.merchant_name);
      
      if (!categorySpending[category]) {
        categorySpending[category] = 0;
      }
      
      categorySpending[category] += transaction.amount;
    });
    
    // Update budget spending
    const updatedBudgets = [];
    for (const budget of budgets) {
      const spent = categorySpending[budget.category] || 0;
      
      await budget.update({ spent });
      updatedBudgets.push({
        ...budget.toJSON(),
        spent,
        remaining: budget.limit - spent,
        percentUsed: (spent / budget.limit) * 100
      });
    }
    
    res.json({
      message: 'Budget spending updated successfully',
      budgets: updatedBudgets,
      period: currentPeriod
    });
    
  } catch (error) {
    console.error('Error updating budget spending:', error);
    res.status(500).json({ 
      message: 'Failed to update budget spending', 
      error: error.message 
    });
  }
};

// Function to delete a budget
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userSub = req.user.sub;
    
    // Find and delete budget
    const budget = await Budget.findOne({
      where: {
        id,
        userSub // Ensure user owns this budget
      }
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    await budget.destroy();
    
    res.json({ message: 'Budget deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ 
      message: 'Failed to delete budget', 
      error: error.message 
    });
  }
};

// Helper function to map categories (same as analyticsController)
const mapCategory = (plaidCategories, merchantName) => {
  if (!plaidCategories || plaidCategories.length === 0) {
    return 'Other';
  }
  
  const primaryCategory = plaidCategories[0];
  
  const CATEGORY_MAPPING = {
    'Food and Drink': 'Food & Dining',
    'Shops': 'Shopping',
    'Recreation': 'Entertainment',
    'Transportation': 'Transportation',
    'Healthcare': 'Healthcare',
    'Service': 'Services',
    'Bank Fees': 'Fees',
    'Transfer': 'Transfer',
    'Deposit': 'Income',
  };
  
  if (CATEGORY_MAPPING[primaryCategory]) {
    return CATEGORY_MAPPING[primaryCategory];
  }
  
  return primaryCategory || 'Other';
};

// Export functions
module.exports = {
  createBudget,
  getBudgets,
  updateBudgetSpending,
  deleteBudget
};
```

**Key concepts:**
- **CRUD Operations**: Create, Read, Update, Delete operations for budgets
- **Input Validation**: Ensuring data meets requirements before processing
- **Data Aggregation**: Calculating spending totals by category
- **Percentage Calculations**: Determining budget usage percentages
- **Business Logic**: Rules for budget management and tracking

---

### 📁 routes/ Directory - URL Mapping

#### `plaidRoutes.js` - Bank Connection Routes
**What it does:** Defines URL endpoints for bank-related operations.

```javascript
const express = require('express');
const { 
  createLinkToken, 
  exchangePublicToken, 
  getAccounts, 
  getTransactions 
} = require('../controllers/plaidController');
const { verifyToken: requireAuth } = require('../middleware/authMiddleware');

// Create router instance
const router = express.Router();

// Define routes (like creating a menu for a restaurant)
router.get('/create-link-token', requireAuth, createLinkToken);
router.post('/exchange-public-token', requireAuth, exchangePublicToken);
router.get('/accounts', requireAuth, getAccounts);
router.get('/transactions', requireAuth, getTransactions);

// Export router
module.exports = router;
```

#### `analyticsRoutes.js` - Analytics Routes
**What it does:** Defines URL endpoints for financial analytics.

```javascript
const express = require('express');
const { 
  getSpendingAnalytics, 
  getInsights 
} = require('../controllers/analyticsController');
const { verifyToken: requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Analytics routes
router.get('/spending', requireAuth, getSpendingAnalytics);
router.get('/insights', requireAuth, getInsights);

module.exports = router;
```

#### `budgetRoutes.js` - Budget Management Routes
**What it does:** Defines URL endpoints for budget operations.

```javascript
const express = require('express');
const { 
  createBudget, 
  getBudgets, 
  updateBudgetSpending, 
  deleteBudget 
} = require('../controllers/budgetController');
const { verifyToken: requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Budget routes
router.post('/', requireAuth, createBudget);           // Create budget
router.get('/', requireAuth, getBudgets);              // Get budgets
router.put('/update-spending', requireAuth, updateBudgetSpending); // Update spending
router.delete('/:id', requireAuth, deleteBudget);     // Delete budget

module.exports = router;
```

**Key concepts:**
- **Express Router**: Organizes routes into modules
- **HTTP Methods**: GET (retrieve), POST (create), PUT (update), DELETE (remove)
- **Middleware**: Authentication runs before route handlers
- **Route Parameters**: `:id` captures dynamic values from URL

---

### 📄 `.gitignore` - Version Control Exclusions
**What it does:** Tells Git which files to ignore when tracking changes.

```gitignore
# Dependencies
node_modules/

# Environment variables (contains secrets)
.env

# Logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Build outputs
dist/
build/

# Database files
*.db
*.sqlite

# Generated PDFs
*.pdf
```

**Key concepts:**
- **Security**: Never commit sensitive files like `.env`
- **Dependencies**: `node_modules` can be regenerated
- **Build Artifacts**: Generated files don't need version control
- **Personal Files**: IDE settings and OS files are user-specific

---

## 🔐 Environment Variables (.env file)
**What it does:** Stores sensitive configuration that shouldn't be in code.

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_app
DB_USER=postgres
DB_PASSWORD=your_password_here

# Plaid Configuration
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox

# AWS Cognito Configuration
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=your_user_pool_id
COGNITO_CLIENT_ID=your_client_id

# Server Configuration
PORT=3001
NODE_ENV=development
```

**Key concepts:**
- **Security**: Sensitive data stays out of source code
- **Environment-specific**: Different values for development/production
- **Never commit**: This file should never be added to version control

---

## 🚀 How Everything Works Together

1. **Server starts** (`server.js`) and connects to database
2. **User logs in** through frontend, gets JWT token
3. **Frontend sends requests** to backend with token
4. **Middleware checks** if token is valid (`authMiddleware.js`)
5. **Routes direct** requests to appropriate controllers
6. **Controllers process** business logic and call external APIs
7. **Models interact** with database to store/retrieve data
8. **Response sent** back to frontend with requested data

This backend provides a secure, scalable foundation for our AI Finance WebApp, handling everything from user authentication to financial data analysis while keeping sensitive information protected.