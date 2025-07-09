# AI Finance WebApp - Server Directory

## 🎯 What is this?
This is the **backend server** of our AI Finance WebApp. Think of it as the "brain" that handles all the heavy lifting behind the scenes - managing data, connecting to external services, and providing information to the frontend.

## 📁 Project Structure Overview

```
server/
├── 📄 server.js                    # Main server file (the starting point)
├── 📄 package.json                 # Project information and dependencies
├── 📄 package-lock.json            # Exact versions of installed packages
├── 📄 .gitignore                   # Files to ignore in version control
├── 📁 config/
│   └── 📄 database.js              # Database connection settings
├── 📁 controllers/
│   ├── 📄 analyticsController.js   # Handles spending analytics and insights
│   ├── 📄 budgetController.js      # Manages budgets and budget tracking
│   └── 📄 plaidController.js       # Connects to Plaid API for bank data
├── 📁 middleware/
│   └── 📄 authMiddleware.js        # Security layer for user authentication
├── 📁 models/
│   ├── 📄 Budget.js                # Database structure for budgets
│   ├── 📄 Item.js                  # Database structure for bank connections
│   └── 📄 User.js                  # Database structure for users
└── 📁 routes/
    ├── 📄 analyticsRoutes.js       # URL paths for analytics features
    ├── 📄 budgetRoutes.js          # URL paths for budget features
    └── 📄 plaidRoutes.js           # URL paths for bank connection features
```

---

## 📄 File-by-File Explanation

### 🟢 Root Files

#### `server.js` - The Heart of Our Server
**What it does:** This is like the "main entrance" of our server. When you start the server, this file runs first.

**Key concepts:**
- **Express**: A framework that makes creating web servers easy in Node.js
- **Middleware**: Functions that run between receiving a request and sending a response
- **Routes**: Different URL paths that handle different types of requests

**Line-by-line breakdown:**
```javascript
// 1. Import necessary libraries
const express = require('express'); // Web server framework
const cors = require('cors'); // Allows frontend to talk to backend
const dotenv = require('dotenv'); // Loads environment variables

// 2. Load environment variables from .env file
dotenv.config();

// 3. Import our custom files
const plaidRoutes = require('./routes/plaidRoutes'); // Bank connection routes
const analyticsRoutes = require('./routes/analyticsRoutes'); // Analytics routes  
const budgetRoutes = require('./routes/budgetRoutes'); // Budget routes

// 4. Import database models (these define our data structure)
require('./models/User'); // User account structure
require('./models/Item'); // Bank connection structure
require('./models/Budget'); // Budget structure

// 5. Create the Express application
const app = express();

// 6. Set up middleware (functions that process requests)
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON from requests

// 7. Connect routes to URL paths
app.use('/api/plaid', plaidRoutes); // All /api/plaid/* requests go to plaidRoutes
app.use('/api/analytics', analyticsRoutes); // All /api/analytics/* requests go to analyticsRoutes
app.use('/api/budgets', budgetRoutes); // All /api/budgets/* requests go to budgetRoutes

// 8. Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### `package.json` - Project Information
**What it does:** This file tells Node.js what our project is and what external libraries (dependencies) it needs.

**Key sections:**
```json
{
  "name": "server", // Project name
  "version": "1.0.0", // Project version
  "main": "server.js", // Entry point file
  "dependencies": { // External libraries we need
    "express": "^5.1.0", // Web server framework
    "cors": "^2.8.5", // Cross-origin resource sharing
    "dotenv": "^17.0.1", // Environment variables loader
    "sequelize": "^6.37.7", // Database ORM (Object-Relational Mapping)
    "pg": "^8.16.3", // PostgreSQL database driver
    "plaid": "^36.0.0", // Plaid API for bank connections
    "jsonwebtoken": "^9.0.2", // JWT token handling
    "jwks-rsa": "^3.2.0", // JSON Web Key Set for authentication
    "pdfkit": "^0.17.1" // PDF generation library
  }
}
```

**What each dependency does:**
- **express**: Makes creating web servers easy
- **cors**: Allows our frontend (running on different port) to talk to backend
- **dotenv**: Loads secret keys and configuration from `.env` file
- **sequelize**: Makes working with databases easier (like a translator)
- **pg**: Connects to PostgreSQL database
- **plaid**: Official library to connect to Plaid's banking API
- **jsonwebtoken**: Handles user authentication tokens
- **jwks-rsa**: Helps verify authentication tokens
- **pdfkit**: Creates PDF files (for bank statements)

#### `.gitignore` - What to Hide from Version Control
**What it does:** Tells Git which files to ignore when saving changes.

**Key sections:**
```ignore
# Dependencies (don't save these, they can be reinstalled)
node_modules/

# Environment variables (CRITICAL - these contain secrets!)
.env
.env.local

# Build outputs (generated files)
dist/
build/

# Logs (temporary files)
*.log

# Database files (if using SQLite)
*.db
*.sqlite

# PDF files (generated statements)
*.pdf
```

---

### 📁 config/ Directory

#### `database.js` - Database Connection Setup
**What it does:** Configures how our server connects to the PostgreSQL database.

**Line-by-line explanation:**
```javascript
// 1. Import Sequelize (database toolkit)
const { Sequelize } = require('sequelize');

// 2. Load environment variables
require('dotenv').config();

// 3. Create database connection
const sequelize = new Sequelize(
  process.env.DB_NAME,     // Database name (from .env file)
  process.env.DB_USER,     // Database username (from .env file)  
  process.env.DB_PASSWORD, // Database password (from .env file)
  {
    host: process.env.DB_HOST, // Database server address
    dialect: 'postgres',       // Type of database (PostgreSQL)
    logging: false,            // Don't log SQL queries (set to true for debugging)
    define: {
      freezeTableName: true,   // Don't pluralize table names
      timestamps: true         // Add createdAt and updatedAt automatically
    },
    pool: {                    // Connection pool settings
      max: 5,                  // Maximum connections
      min: 0,                  // Minimum connections
      acquire: 30000,          // Max time to get connection (30 seconds)
      idle: 10000              // Max time connection can be idle (10 seconds)
    }
  }
);

// 4. Test the connection
sequelize.authenticate()
  .then(() => console.log('✅ DB connected successfully.'))
  .catch(err => console.error('❌ DB connection failed:', err));

// 5. Sync database (create tables if they don't exist)
sequelize.sync({ alter: true }) // alter: true updates existing tables
  .then(() => console.log('✅ DB tables synchronized.'))
  .catch(err => console.error('❌ DB sync failed:', err));

// 6. Export for use in other files
module.exports = sequelize;
```

**Key concepts:**
- **Environment variables**: Secret values stored in `.env` file
- **Connection pooling**: Managing multiple database connections efficiently
- **Sequelize**: An ORM (Object-Relational Mapping) that makes database operations easier

---

### 📁 models/ Directory
Models define the structure of our database tables. Think of them as blueprints for data.

#### `User.js` - User Account Structure
**What it does:** Defines how user accounts are stored in the database.

```javascript
// 1. Import necessary tools
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 2. Define the User model (table structure)
const User = sequelize.define('User', {
  // Primary key (unique identifier)
  sub: {
    type: DataTypes.STRING,    // Text field
    primaryKey: true,          // This is the main identifier
    allowNull: false           // Cannot be empty
  },
  
  // User's email address
  email: {
    type: DataTypes.STRING,    // Text field
    allowNull: false,          // Cannot be empty
    unique: true,              // No two users can have same email
    validate: {
      isEmail: true            // Must be valid email format
    }
  },
  
  // User's full name
  name: {
    type: DataTypes.STRING,    // Text field
    allowNull: true            // Can be empty
  },
  
  // Account creation timestamp
  createdAt: {
    type: DataTypes.DATE,      // Date and time
    allowNull: false,          // Cannot be empty
    defaultValue: DataTypes.NOW // Use current time by default
  }
});

// 3. Export for use in other files
module.exports = User;
```

#### `Item.js` - Bank Connection Structure
**What it does:** Stores information about connected bank accounts.

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Item = sequelize.define('Item', {
  // Unique identifier
  id: {
    type: DataTypes.INTEGER,   // Number
    primaryKey: true,          // Main identifier
    autoIncrement: true        // Automatically increases
  },
  
  // Which user owns this bank connection
  userSub: {
    type: DataTypes.STRING,    // Text field
    allowNull: false,          // Cannot be empty
    references: {              // Links to User table
      model: 'Users',
      key: 'sub'
    }
  },
  
  // Plaid's identifier for this bank connection
  item_id: {
    type: DataTypes.STRING,    // Text field
    allowNull: false,          // Cannot be empty
    unique: true               // Each item_id is unique
  },
  
  // Secret token to access bank data
  access_token: {
    type: DataTypes.TEXT,      // Long text field
    allowNull: false           // Cannot be empty
  },
  
  // Name of the bank (e.g., "Chase", "Bank of America")
  institution_name: {
    type: DataTypes.STRING,    // Text field
    allowNull: true            // Can be empty
  }
});

module.exports = Item;
```

#### `Budget.js` - Budget Structure
**What it does:** Defines how budgets are stored and calculated.

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define('Budget', {
  // Unique identifier
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Which user owns this budget
  userSub: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'sub'
    }
  },
  
  // Budget category (e.g., "Food", "Transportation")
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true           // Cannot be empty string
    }
  },
  
  // How much money is budgeted
  budgetAmount: {
    type: DataTypes.DECIMAL(10, 2), // Decimal with 10 digits, 2 after decimal
    allowNull: false,
    validate: {
      min: 0                   // Cannot be negative
    }
  },
  
  // How much has been spent so far
  currentSpent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  
  // Time period (weekly, monthly, yearly)
  period: {
    type: DataTypes.ENUM('weekly', 'monthly', 'yearly'), // Only these values allowed
    defaultValue: 'monthly'
  },
  
  // When budget period starts
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  // When budget period ends
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  
  // Alert when spending reaches this percentage (0.8 = 80%)
  alertThreshold: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.80,
    validate: {
      min: 0,
      max: 1
    }
  },
  
  // Whether budget is active
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  // Custom methods for this model
  instanceMethods: {
    // Calculate remaining budget amount
    getRemainingAmount() {
      return parseFloat(this.budgetAmount) - parseFloat(this.currentSpent);
    },
    
    // Calculate percentage used (0.5 = 50%)
    getUsagePercentage() {
      if (parseFloat(this.budgetAmount) === 0) return 0;
      return parseFloat(this.currentSpent) / parseFloat(this.budgetAmount);
    },
    
    // Check if budget is exceeded
    isOverBudget() {
      return parseFloat(this.currentSpent) > parseFloat(this.budgetAmount);
    },
    
    // Check if near spending limit
    isNearLimit() {
      return this.getUsagePercentage() >= parseFloat(this.alertThreshold);
    }
  }
});

module.exports = Budget;
```

---

### 📁 middleware/ Directory

#### `authMiddleware.js` - Security Guard
**What it does:** Checks if users are properly logged in before allowing access to protected features.

```javascript
// 1. Import tools for handling authentication
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// 2. Set up client to get public keys for verifying tokens
const client = jwksClient({
  jwksUri: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_b7ouuqkHr/.well-known/jwks.json'
});

// 3. Function to get signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// 4. Main authentication function
const verifyToken = async (req, res, next) => {
  try {
    // Get token from request header
    const authHeader = req.headers.authorization;
    
    // Check if token exists
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    jwt.verify(token, getKey, {
      audience: '59lgthmmkjqcda7ektkb54mt2n', // App client ID
      issuer: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_b7ouuqkHr',
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Add user info to request object
      req.user = {
        userId: decoded.sub,
        email: decoded.email,
        ...decoded
      };
      
      // Continue to next middleware/route
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { verifyToken };
```

**Key concepts:**
- **JWT (JSON Web Token)**: A secure way to transmit user information
- **Middleware**: Functions that run before your main route handlers
- **Authentication vs Authorization**: Authentication verifies who you are, authorization verifies what you can do

---

### 📁 controllers/ Directory
Controllers contain the business logic - they process requests and return responses.

#### `plaidController.js` - Bank Connection Handler
**What it does:** Manages all interactions with Plaid API for bank connections, accounts, and transactions.

**Key functions breakdown:**

1. **createLinkToken** - Creates a token for Plaid Link (bank connection widget)
```javascript
exports.createLinkToken = async (req, res) => {
  try {
    // Request a link token from Plaid
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: req.user.userId },
      client_name: "AI Finance WebApp",
      products: ['transactions'], // What data we want
      country_codes: ['US', 'CA'], // Which countries
      language: 'en'
    });
    
    // Send token back to frontend
    res.json({ link_token: response.data.link_token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create link token' });
  }
};
```

2. **exchangePublicToken** - Converts temporary token to permanent access token
```javascript
exports.exchangePublicToken = async (req, res) => {
  try {
    const { public_token } = req.body;
    
    // Exchange public token for access token
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: public_token
    });
    
    // Save access token to database
    await Item.create({
      userSub: req.user.userId,
      item_id: response.data.item_id,
      access_token: response.data.access_token
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to exchange token' });
  }
};
```

3. **getAccounts** - Fetches user's bank accounts
4. **getTransactions** - Fetches transaction history
5. **generatePDF** - Creates PDF bank statements

#### `budgetController.js` - Budget Management
**What it does:** Handles all budget-related operations (create, read, update, delete).

**Key functions:**

1. **createBudget** - Creates a new budget
```javascript
exports.createBudget = async (req, res) => {
  try {
    const { category, budgetAmount, period, alertThreshold } = req.body;
    
    // Validate input
    if (!category || !budgetAmount) {
      return res.status(400).json({ error: 'Category and amount required' });
    }
    
    // Calculate date range based on period
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      // ... more cases
    }
    
    // Create budget in database
    const budget = await Budget.create({
      userSub: req.user.userId,
      category,
      budgetAmount,
      period,
      startDate,
      endDate,
      alertThreshold: alertThreshold || 0.80
    });
    
    res.status(201).json({ message: 'Budget created', budget });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget' });
  }
};
```

2. **getBudgets** - Retrieves all user budgets with current spending
3. **updateBudget** - Modifies existing budget
4. **deleteBudget** - Removes a budget
5. **getBudgetCategories** - Returns available budget categories

#### `analyticsController.js` - Data Analysis and Insights
**What it does:** Processes transaction data to provide spending analytics, comparisons, and AI-driven insights.

**Key functions:**

1. **getSpendingAnalytics** - Analyzes spending by category
```javascript
exports.getSpendingAnalytics = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'weekly':
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
        break;
      // ... more periods
    }
    
    // Get user's bank connections
    const items = await Item.findAll({ where: { userSub: userId } });
    
    // Fetch and categorize transactions
    let categorySpending = await getCategorySpendingFromTransactions(items, dateFilter);
    
    // Calculate totals
    const totalSpending = categorySpending.reduce((sum, cat) => sum + cat.amount, 0);
    
    res.json({
      categorySpending,
      totalSpending: Math.abs(totalSpending),
      period
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
```

2. **getSpendingComparison** - Compares current vs previous period
3. **getBudgetAnalysis** - Analyzes budget vs actual spending
4. **getCategorySpendingFromTransactions** - Helper function that:
   - Fetches transactions from Plaid
   - Categorizes them using smart logic
   - Returns spending by category

**Category Mapping Logic:**
The analytics controller includes sophisticated logic to categorize transactions:

```javascript
// Enhanced category mapping
const CATEGORY_MAPPING = {
  'Food and Drink': 'Food & Dining',
  'Transportation': 'Transportation',
  'Shops': 'Shopping',
  // ... many more mappings
};

// Merchant-based mapping for better accuracy
const MERCHANT_CATEGORY_MAPPING = {
  'uber': 'Transportation',
  'starbucks': 'Food & Dining',
  'amazon': 'Shopping',
  // ... many more merchants
};

// Function to determine transaction category
function determineTransactionCategory(transaction) {
  // 1. Try merchant name first
  if (merchantName) {
    for (const [merchant, category] of Object.entries(MERCHANT_CATEGORY_MAPPING)) {
      if (merchantName.toLowerCase().includes(merchant)) {
        return category;
      }
    }
  }
  
  // 2. Use Plaid's category
  if (transaction.category && transaction.category.length > 0) {
    const categoryName = transaction.category[0];
    if (CATEGORY_MAPPING[categoryName]) {
      return CATEGORY_MAPPING[categoryName];
    }
  }
  
  // 3. Pattern matching as fallback
  const combinedText = `${merchantName} ${transactionName}`.toLowerCase();
  if (combinedText.match(/\b(taxi|uber|lyft|transport)\b/)) {
    return 'Transportation';
  }
  
  // 4. Default fallback
  return 'Other';
}
```

---

### 📁 routes/ Directory
Routes define the URL endpoints and connect them to controller functions.

#### `plaidRoutes.js` - Bank Connection Routes
```javascript
const express = require('express');
const router = express.Router();
const plaidController = require('../controllers/plaidController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public route (no authentication needed)
router.post('/link-token', verifyToken, plaidController.createLinkToken);

// Protected routes (authentication required)
router.post('/exchange-public-token', verifyToken, plaidController.exchangePublicToken);
router.get('/accounts', verifyToken, plaidController.getAccounts);
router.get('/transactions', verifyToken, plaidController.getTransactions);
router.get('/statement-pdf', verifyToken, plaidController.generatePDF);

module.exports = router;
```

**Route breakdown:**
- `POST /api/plaid/link-token` → Creates token for bank connection
- `POST /api/plaid/exchange-public-token` → Saves bank connection
- `GET /api/plaid/accounts` → Fetches account balances
- `GET /api/plaid/transactions` → Fetches transaction history
- `GET /api/plaid/statement-pdf` → Generates PDF statement

#### `budgetRoutes.js` - Budget Management Routes
```javascript
const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public route
router.get('/categories', budgetController.getBudgetCategories);

// Protected routes
router.use(verifyToken); // Apply authentication to all routes below

router.post('/', budgetController.createBudget);
router.get('/', budgetController.getBudgets);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
```

#### `analyticsRoutes.js` - Analytics and Insights Routes
```javascript
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(verifyToken);

router.get('/spending', analyticsController.getSpendingAnalytics);
router.get('/spending/comparison', analyticsController.getSpendingComparison);
router.get('/budget-analysis', analyticsController.getBudgetAnalysis);

module.exports = router;
```

---

## 🔧 How Everything Works Together

### 1. **Server Startup Process:**
1. `server.js` runs first
2. Loads environment variables from `.env`
3. Connects to database using `config/database.js`
4. Loads all models (`User.js`, `Item.js`, `Budget.js`)
5. Sets up middleware (CORS, JSON parsing, authentication)
6. Registers all routes
7. Starts listening on port 3001

### 2. **Request Flow Example:**
When frontend requests spending analytics:

1. **Request**: `GET /api/analytics/spending?period=monthly`
2. **Route**: `analyticsRoutes.js` catches the request
3. **Middleware**: `authMiddleware.js` verifies user is logged in
4. **Controller**: `analyticsController.getSpendingAnalytics()` processes request
5. **Database**: Queries database for user's bank connections
6. **External API**: Calls Plaid API to get transactions
7. **Processing**: Categorizes transactions using smart logic
8. **Response**: Returns categorized spending data as JSON

### 3. **Security Layers:**
1. **CORS**: Controls which websites can access our API
2. **Environment Variables**: Keeps secrets out of code
3. **JWT Authentication**: Verifies user identity
4. **Input Validation**: Checks data before processing
5. **Database Constraints**: Prevents invalid data storage

### 4. **Error Handling:**
Each controller includes try-catch blocks to handle errors gracefully:
```javascript
try {
  // Main logic here
  res.json({ success: true, data: result });
} catch (error) {
  console.error('Error details:', error);
  res.status(500).json({ error: 'User-friendly error message' });
}
```

---

## 🚀 Environment Setup

To run this server, you need a `.env` file with these variables:

```env
# Database Configuration
DB_HOST=localhost
DB_NAME=finance_app
DB_USER=your_username
DB_PASSWORD=your_password

# Plaid API Credentials
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox

# Server Configuration
PORT=3001
```

## 🔄 Common Operations

### Starting the Server:
```bash
cd server
npm install  # Install dependencies
npm start    # Start the server
```

### Adding New Features:
1. Create new route in appropriate routes file
2. Add controller function to handle the logic
3. Update model if database changes needed
4. Test the endpoint

### Debugging:
- Check server console for error messages
- Add `console.log()` statements to trace execution
- Use database logging: set `logging: true` in `database.js`
- Test API endpoints with Postman or similar tool

This server provides a robust foundation for a financial application with secure user authentication, bank connectivity, spending analytics, and budget management capabilities.
