# AI Finance WebApp - Client Directory

## 🎯 What is this?
This is the **frontend** of our AI Finance WebApp. Think of it as the "face" that users see and interact with - the website interface with buttons, forms, charts, and beautiful design that makes everything user-friendly.

## 📁 Project Structure Overview

```
client/
├── 📄 index.html                   # Main HTML file (entry point for web browser)
├── 📄 package.json                 # Project information and dependencies
├── 📄 package-lock.json            # Exact versions of installed packages
├── 📄 vite.config.js               # Build tool configuration
├── 📄 eslint.config.js             # Code quality checker configuration
├── 📄 .gitignore                   # Files to ignore in version control
├── 📄 README.md                    # Basic project documentation
├── 📁 public/
│   └── 📄 vite.svg                 # Favicon (small icon in browser tab)
├── 📁 src/                         # Source code directory
│   ├── 📄 main.jsx                 # JavaScript entry point
│   ├── 📄 App.jsx                  # Main application component
│   ├── 📄 index.css                # Global styles
│   ├── 📄 aws-exports.js           # AWS authentication configuration
│   ├── 📁 assets/
│   │   └── 📄 react.svg            # React logo image
│   ├── 📁 components/              # Reusable UI components
│   │   ├── 📄 AccountsList.jsx     # Displays bank accounts
│   │   ├── 📄 BudgetManager.jsx    # Budget creation and management
│   │   ├── 📄 InsightsPanel.jsx    # Analytics and spending insights
│   │   ├── 📄 PlaidLinkButton.jsx  # Bank connection button
│   │   ├── 📄 PlaidProvider.jsx    # Plaid script loader
│   │   ├── 📄 SessionManager.jsx   # Session security handler
│   │   ├── 📄 SpendingChart.jsx    # Pie charts for spending
│   │   └── 📄 TransactionsList.jsx # Transaction history display
│   ├── 📁 hooks/
│   │   └── 📄 useSessionSecurity.js # Custom hook for session management
│   ├── 📁 pages/
│   │   └── 📄 DashboardPage.jsx    # Main dashboard page
│   ├── 📁 services/
│   │   └── 📄 api.js               # Backend communication layer
│   └── 📁 utils/
│       └── 📄 sessionUtils.js      # Session utility functions
```

---

## 📄 File-by-File Explanation

### 🟢 Root Files

#### `index.html` - The Web Page Foundation
**What it does:** This is the actual HTML file that browsers load. It's like the skeleton of our web page.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Page metadata -->
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Finance WebApp</title>
  </head>
  <body>
    <!-- Where our React app will be mounted -->
    <div id="root"></div>
    
    <!-- JavaScript entry point -->
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Key concepts:**
- **DOCTYPE**: Tells browser this is HTML5
- **viewport meta tag**: Makes the site mobile-friendly
- **root div**: Where React injects our entire application
- **script tag**: Loads our JavaScript code

#### `package.json` - Project Blueprint
**What it does:** Tells Node.js what our frontend project needs to run.

```json
{
  "name": "client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",           // Start development server
    "build": "vite build",   // Build for production
    "preview": "vite preview" // Preview production build
  },
  "dependencies": {
    // Core React libraries
    "react": "^18.2.0",                    // Main React framework
    "react-dom": "^18.2.0",               // React DOM manipulation
    
    // AWS Authentication
    "@aws-amplify/auth": "^6.3.8",        // User authentication
    "@aws-amplify/ui-react": "^6.1.13",   // Pre-built UI components
    
    // API Communication
    "axios": "^1.7.7",                    // HTTP requests to backend
    
    // Data Visualization
    "recharts": "^2.13.3",                // Charts and graphs
    
    // Date Handling
    "date-fns": "^4.1.0",                 // Date formatting and manipulation
    
    // PDF Generation
    "jspdf": "^2.5.2"                     // Generate PDF files in browser
  },
  "devDependencies": {
    // Build tools
    "@vitejs/plugin-react": "^4.3.1",     // Vite React plugin
    "vite": "^5.4.1",                     // Build tool (fast!)
    "eslint": "^9.9.0"                    // Code quality checker
  }
}
```

**What each dependency does:**
- **react**: The core library for building user interfaces
- **react-dom**: Connects React to the web browser
- **@aws-amplify/auth**: Handles user login/logout/registration
- **@aws-amplify/ui-react**: Pre-made login forms and UI components
- **axios**: Makes it easy to send requests to our backend server
- **recharts**: Creates beautiful charts and graphs
- **date-fns**: Helps format dates like "July 9, 2025"
- **jspdf**: Generates PDF files right in the browser
- **vite**: Super fast build tool (much faster than older tools)

#### `vite.config.js` - Build Tool Configuration
**What it does:** Configures Vite (our build tool) for React development.

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],           // Enable React support
  server: {
    port: 5173,                 // Development server port
    proxy: {                    // Redirect API calls to backend
      '/api': {
        target: 'http://localhost:3001',  // Backend server
        changeOrigin: true
      }
    }
  }
})
```

**Key concepts:**
- **Plugins**: Add extra functionality to Vite
- **Proxy**: Redirects `/api/*` requests to backend server
- **Hot reloading**: Automatically updates page when you save code

---

### 📁 src/ Directory - The Heart of Our App

#### `main.jsx` - Application Entry Point
**What it does:** This is where JavaScript takes over from HTML. It's the first React code that runs.

```javascript
// 1. Import necessary libraries
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 2. Import AWS Amplify for authentication
import { Amplify } from 'aws-amplify'
import awsExports from './aws-exports.js'

// 3. Configure AWS authentication
Amplify.configure(awsExports)

// 4. Render the main App component into the DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Line-by-line explanation:**
1. **Import React**: Gets the React library
2. **Import ReactDOM**: Connects React to browser DOM
3. **Import App**: Our main application component
4. **Import CSS**: Global styles for the entire app
5. **Configure Amplify**: Sets up AWS authentication
6. **Render**: Puts our React app inside the HTML div with id="root"

**Key concepts:**
- **StrictMode**: Helps catch potential problems during development
- **createRoot**: Modern way to render React apps (React 18+)

#### `App.jsx` - Main Application Component
**What it does:** The top-level component that wraps our entire application.

```javascript
import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import DashboardPage from './pages/DashboardPage';
import SessionManager from './components/SessionManager';
import PlaidProvider from './components/PlaidProvider';

function App() {
  return (
    // Wrap everything in authentication
    <Authenticator>
      {({ signOut, user }) => (
        // Provide session security
        <SessionManager user={user}>
          {/* Provide Plaid functionality */}
          <PlaidProvider>
            {/* Main dashboard */}
            <DashboardPage signOut={signOut} user={user} />
          </PlaidProvider>
        </SessionManager>
      )}
    </Authenticator>
  );
}

export default App;
```

**Component hierarchy:**
1. **Authenticator**: Handles login/logout UI
2. **SessionManager**: Manages session security (auto-logout on tab close)
3. **PlaidProvider**: Loads Plaid SDK for bank connections
4. **DashboardPage**: The main application interface

#### `index.css` - Global Styles
**What it does:** Defines the visual appearance of our entire application.

```css
/* CSS Custom Properties (Variables) for consistent theming */
:root {
  /* Light theme colors */
  --primary-color: #667eea;
  --primary-hover: #5a6fd8;
  --secondary-color: #764ba2;
  --accent-color: #f093fb;
  
  /* Background colors */
  --background-color: #f8fafc;
  --surface-color: #ffffff;
  --card-background: #ffffff;
  
  /* Text colors */
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --text-muted: #718096;
  
  /* Border and shadow */
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;
  
  /* Border radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

/* Global reset and base styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background-color: var(--background-color);
  color: var(--text-primary);
  line-height: 1.6;
}

/* Button styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Card styles */
.card {
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .card {
    padding: var(--spacing-md);
    margin: var(--spacing-sm);
  }
}
```

**Key concepts:**
- **CSS Variables**: Reusable values that make theming consistent
- **Global Reset**: Removes default browser styling
- **Utility Classes**: Reusable styles like `.btn` and `.card`
- **Responsive Design**: Adapts to different screen sizes

---

### 📁 components/ Directory - Reusable UI Building Blocks

#### `AccountsList.jsx` - Bank Accounts Display
**What it does:** Shows user's connected bank accounts with balances.

```javascript
import React from 'react';

// Component that receives accounts data as props
const AccountsList = ({ accounts, loading }) => {
  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading accounts...</p>
      </div>
    );
  }

  // Show message if no accounts connected
  if (!accounts || accounts.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Bank Accounts Connected</h3>
        <p>Connect your bank account to get started</p>
      </div>
    );
  }

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="accounts-list">
      <h3>Your Accounts</h3>
      {accounts.map(account => (
        <div key={account.account_id} className="account-card">
          <div className="account-info">
            <h4>{account.name}</h4>
            <p className="account-type">{account.subtype}</p>
          </div>
          <div className="account-balance">
            <span className="balance-amount">
              {formatCurrency(account.balances.current)}
            </span>
            {account.balances.available && (
              <span className="available-balance">
                Available: {formatCurrency(account.balances.available)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccountsList;
```

**Key React concepts:**
- **Props**: Data passed from parent component
- **Conditional Rendering**: Show different content based on conditions
- **Map Function**: Render list of items
- **Key Prop**: Unique identifier for list items (required by React)

#### `TransactionsList.jsx` - Transaction History Display
**What it does:** Shows transaction history with filtering and PDF export capabilities.

```javascript
import React, { useState, useMemo } from 'react';
import api from '../services/api';

const TransactionsList = ({ transactions, accounts, loading }) => {
  // State for filtering
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Filter transactions based on selected account
  const filteredTransactions = useMemo(() => {
    if (selectedAccount === 'all') {
      return transactions;
    }
    return transactions.filter(transaction => 
      transaction.account_id === selectedAccount
    );
  }, [transactions, selectedAccount]);

  // Handle PDF generation
  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedAccount !== 'all') {
        params.append('account_id', selectedAccount);
      }
      
      // Request PDF from backend
      const response = await api.get(`/plaid/statement-pdf?${params}`, {
        responseType: 'blob' // Important for file downloads
      });
      
      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bank-statement-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="transactions-list">
      {/* Header with controls */}
      <div className="transactions-header">
        <h3>Transaction History</h3>
        
        <div className="controls">
          {/* Account filter dropdown */}
          <select 
            value={selectedAccount} 
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="account-filter"
          >
            <option value="all">All Accounts</option>
            {accounts.map(account => (
              <option key={account.account_id} value={account.account_id}>
                {account.name}
              </option>
            ))}
          </select>

          {/* PDF generation button */}
          <button 
            onClick={generatePDF}
            disabled={isGeneratingPDF || filteredTransactions.length === 0}
            className="btn btn-secondary"
          >
            {isGeneratingPDF ? 'Generating...' : '📄 Print Statement'}
          </button>
        </div>
      </div>

      {/* Transaction list */}
      <div className="transactions-container">
        {filteredTransactions.map(transaction => (
          <div key={transaction.transaction_id} className="transaction-item">
            <div className="transaction-info">
              <h4>{transaction.name}</h4>
              <p className="merchant">{transaction.merchant_name || 'Unknown Merchant'}</p>
              <p className="date">{new Date(transaction.date).toLocaleDateString()}</p>
            </div>
            <div className="transaction-amount">
              <span className={transaction.amount > 0 ? 'expense' : 'income'}>
                {transaction.amount > 0 ? '-' : '+'}{Math.abs(transaction.amount).toFixed(2)}
              </span>
              <span className="category">{transaction.category?.[0] || 'Other'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with count */}
      <div className="transactions-footer">
        <p>Showing {filteredTransactions.length} transactions</p>
      </div>
    </div>
  );
};

export default TransactionsList;
```

**Key concepts:**
- **useState**: Manages component state (filter selection, loading states)
- **useMemo**: Optimizes expensive calculations (filtering)
- **Event Handlers**: Respond to user interactions
- **Blob API**: Handles file downloads
- **Query Parameters**: Send filter options to backend

#### `SpendingChart.jsx` - Data Visualization
**What it does:** Creates interactive pie charts showing spending by category.

```javascript
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const SpendingChart = ({ data, title = "Spending by Category" }) => {
  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <div className="empty-chart">
        <div className="empty-icon">📊</div>
        <h3>No Data Available</h3>
        <p>Connect your bank account to see spending insights</p>
      </div>
    );
  }

  // Transform data for recharts
  const chartData = data.map(item => ({
    name: item.category,
    value: Math.abs(item.amount),
    count: item.count,
    color: item.color || getRandomColor()
  }));

  const totalSpent = chartData.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip component
  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalSpent) * 100).toFixed(1);
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-category">{data.name}</p>
          <p className="tooltip-amount">${data.value.toFixed(2)}</p>
          <p className="tooltip-percentage">{percentage}% of total</p>
          <p className="tooltip-count">{data.count} transactions</p>
        </div>
      );
    }
    return null;
  };

  // Custom label function
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for tiny slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="spending-chart">
      <h3 className="chart-title">{title}</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={renderCustomTooltip} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary statistics */}
      <div className="chart-summary">
        <div className="summary-item">
          <span className="summary-label">Total Spent:</span>
          <span className="summary-value">${totalSpent.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Categories:</span>
          <span className="summary-value">{chartData.length}</span>
        </div>
      </div>
    </div>
  );
};

// Helper function for random colors
const getRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#54A0FF'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default SpendingChart;
```

**Key concepts:**
- **Recharts Library**: Professional charting library for React
- **ResponsiveContainer**: Makes charts adapt to container size
- **Custom Components**: Custom tooltip and label rendering
- **Data Transformation**: Converting our data format to chart format

---

This comprehensive guide explains every aspect of the client-side code in beginner-friendly terms, covering React concepts, component architecture, state management, API integration, and modern frontend development practices. The client provides a beautiful, responsive, and feature-rich interface for financial management.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
