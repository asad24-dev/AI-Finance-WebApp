# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# AI Finance WebApp - Client Directory

## 🎯 What is this?
This is the **frontend** of our AI Finance WebApp. Think of it as the "face" that users see and interact with - the website interface with buttons, forms, charts, and beautiful design that makes everything user-friendly. The client handles all the visual elements, user interactions, and communicates with our backend server to display financial data.

## 🔧 What does a Frontend/Client do?
- **Displays the user interface** (buttons, forms, charts, menus)
- **Handles user interactions** (clicking, typing, navigating)
- **Communicates with backend** (sends requests, receives data)
- **Manages user authentication** (login/logout with AWS Cognito)
- **Renders charts and graphs** (visual data representation)
- **Provides responsive design** (works on desktop, tablet, mobile)
- **Manages application state** (remembers user data while using the app)

## 📁 Project Structure Overview

```
client/
├── 📄 index.html                   # Main HTML file (entry point for web browser)
├── 📄 package.json                 # Project information and dependencies
├── 📄 package-lock.json            # Exact versions of installed packages
├── 📄 vite.config.js               # Build tool configuration
├── 📄 eslint.config.js             # Code quality checker configuration
├── 📄 .gitignore                   # Files to ignore in version control
├── 📄 README.md                    # This documentation file
├── 📁 public/
│   ├── 📄 finance-logo.svg         # Custom app logo/favicon
│   └── 📄 vite.svg                 # Default Vite logo (backup)
├── 📁 src/                         # Source code directory
│   ├── 📄 main.jsx                 # JavaScript entry point
│   ├── 📄 App.jsx                  # Main application component
│   ├── 📄 index.css                # Global styles and CSS variables
│   ├── 📄 aws-exports.js           # AWS authentication configuration
│   ├── 📁 assets/
│   │   └── 📄 react.svg            # React logo image
│   ├── 📁 components/              # Reusable UI components
│   │   ├── 📄 AccountsList.jsx     # Displays bank accounts with balances
│   │   ├── 📄 BudgetManager.jsx    # Budget creation and management interface
│   │   ├── 📄 InsightsPanel.jsx    # Financial insights and analytics display
│   │   ├── 📄 PlaidLinkButton.jsx  # Bank connection button component
│   │   ├── 📄 PlaidProvider.jsx    # Plaid SDK loader and context provider
│   │   ├── 📄 SessionManager.jsx   # Session security and tab management
│   │   ├── 📄 SpendingChart.jsx    # Pie charts for spending visualization
│   │   └── 📄 TransactionsList.jsx # Transaction history with filtering
│   ├── 📁 hooks/
│   │   └── 📄 useSessionSecurity.js # Custom hook for session management
│   ├── 📁 pages/
│   │   └── 📄 DashboardPage.jsx    # Main dashboard page layout
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
    <link rel="icon" type="image/svg+xml" href="/finance-logo.svg" />
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

**Line-by-line explanation:**
- **DOCTYPE**: Tells browser this is HTML5
- **meta charset**: Ensures proper character encoding
- **favicon link**: Sets the icon shown in browser tabs
- **viewport meta tag**: Makes the site mobile-friendly
- **title**: Text shown in browser tab
- **root div**: Where React injects our entire application
- **script tag**: Loads our JavaScript code

**Key concepts:**
- **Single Page Application (SPA)**: Everything happens in one HTML file
- **Module loading**: Uses modern ES6 module system
- **Responsive design**: viewport meta tag enables mobile optimization

#### `package.json` - Project Blueprint
**What it does:** Tells Node.js what our frontend project needs to run and how to build it.

```json
{
  "name": "client",
  "private": true,
  "version": "0.0.0",
  "type": "module",                          // Use modern ES6 modules
  "scripts": {
    "dev": "vite",                           // Start development server
    "build": "vite build",                   // Build for production
    "lint": "eslint .",                      // Check code quality
    "preview": "vite preview"                // Preview production build
  },
  "dependencies": {
    // Core React libraries
    "react": "^19.1.0",                      // Main React framework
    "react-dom": "^19.1.0",                 // React DOM manipulation
    "react-router-dom": "^7.6.3",           // Client-side routing
    
    // AWS Authentication
    "@aws-amplify/auth": "^6.13.3",          // User authentication
    "@aws-amplify/ui-react": "^6.11.2",     // Pre-built UI components
    "@aws-amplify/storage": "^6.9.3",       // File storage (if needed)
    "aws-amplify": "^6.15.3",               // Main AWS library
    
    // API Communication
    "axios": "^1.10.0",                     // HTTP requests to backend
    
    // Banking Integration
    "react-plaid-link": "^4.0.1",           // Plaid bank connection
    
    // Data Visualization
    "recharts": "^3.1.0",                   // Charts and graphs
    
    // Date Handling
    "date-fns": "^4.1.0"                    // Date formatting and manipulation
  },
  "devDependencies": {
    // Build tools
    "@vitejs/plugin-react": "^4.5.2",       // Vite React plugin
    "vite": "^7.0.0",                       // Build tool (fast!)
    
    // Code Quality
    "eslint": "^9.29.0",                    // Code quality checker
    "eslint-plugin-react-hooks": "^5.2.0",  // React hooks linting
    "eslint-plugin-react-refresh": "^0.4.20", // Hot reload linting
    
    // TypeScript support (for better development)
    "@types/react": "^19.1.8",              // React type definitions
    "@types/react-dom": "^19.1.6"           // React DOM type definitions
  }
}
```

**What each dependency does:**
- **react**: The core library for building user interfaces with components
- **react-dom**: Connects React to the web browser's DOM
- **react-router-dom**: Enables navigation between different pages/views
- **@aws-amplify/auth**: Handles user login/logout/registration with AWS Cognito
- **@aws-amplify/ui-react**: Pre-made login forms and UI components
- **axios**: Makes it easy to send HTTP requests to our backend server
- **react-plaid-link**: Official React component for Plaid bank connections
- **recharts**: Creates beautiful, responsive charts and graphs
- **date-fns**: Helps format dates like "July 12, 2025" or "2 days ago"
- **vite**: Super fast build tool (much faster than webpack)
- **eslint**: Catches coding errors and enforces consistent style

#### `vite.config.js` - Build Tool Configuration
**What it does:** Configures Vite (our build tool) for React development with optimizations.

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],           // Enable React support with hot reloading
  server: {
    port: 5173,                 // Development server port
    open: true,                 // Automatically open browser
    proxy: {                    // Redirect API calls to backend
      '/api': {
        target: 'http://localhost:3001',  // Backend server URL
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',             // Output directory for production build
    sourcemap: true             // Generate source maps for debugging
  }
})
```

**Key concepts:**
- **Plugins**: Add extra functionality to Vite (React support, hot reloading)
- **Proxy**: Redirects `/api/*` requests to backend server during development
- **Hot reloading**: Automatically updates page when you save code changes
- **Source maps**: Help debug production code by mapping back to original source

#### `eslint.config.js` - Code Quality Configuration
**What it does:** Sets up rules to catch errors and maintain consistent coding style.

```javascript
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },                    // Don't check build files
  {
    files: ['**/*.{js,jsx}'],               // Check all JS and JSX files
    languageOptions: {
      ecmaVersion: 2020,                    // Use modern JavaScript
      globals: globals.browser,             // Browser environment
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },        // Enable JSX syntax
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,                                // React-specific rules
      'react-hooks': reactHooks,            // React hooks rules
      'react-refresh': reactRefresh,        // Hot reload rules
    },
    rules: {
      ...js.configs.recommended.rules,      // Standard JavaScript rules
      ...react.configs.recommended.rules,   // React best practices
      ...reactHooks.configs.recommended.rules, // Hook rules
      'react/jsx-no-target-blank': 'off',   // Allow external links
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

**Key concepts:**
- **Linting**: Automated code quality checking
- **Rules**: Guidelines for writing consistent, error-free code
- **Plugins**: Extensions that add specific rule sets
- **JSX**: React's HTML-in-JavaScript syntax

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

// 3. Configure AWS authentication with our settings
Amplify.configure(awsExports)

// 4. Render the main App component into the DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Line-by-line explanation:**
1. **Import React**: Gets the React library for building components
2. **Import ReactDOM**: Connects React to browser DOM
3. **Import App**: Our main application component
4. **Import CSS**: Global styles for the entire app
5. **Import Amplify**: AWS library for authentication
6. **Import config**: AWS configuration settings
7. **Configure Amplify**: Sets up AWS authentication with our credentials
8. **Render**: Puts our React app inside the HTML div with id="root"

**Key concepts:**
- **StrictMode**: Helps catch potential problems during development
- **createRoot**: Modern way to render React apps (React 18+)
- **Configuration**: Setting up external services (AWS) before app starts

#### `App.jsx` - Main Application Component
**What it does:** The top-level component that wraps our entire application and handles authentication.

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

**Component hierarchy explained:**
1. **Authenticator**: Handles login/logout UI and user management
2. **SessionManager**: Manages session security (auto-logout on tab close)
3. **PlaidProvider**: Loads Plaid SDK for bank connections
4. **DashboardPage**: The main application interface

**Key concepts:**
- **Higher-Order Components (HOC)**: Components that wrap other components
- **Render Props**: Components that provide data through function parameters
- **Provider Pattern**: Sharing data/functionality across the app
- **Composition**: Building complex UIs by combining simpler components

#### `index.css` - Global Styles and Design System
**What it does:** Defines the visual appearance and design system for our entire application.

```css
/* CSS Custom Properties (Variables) for consistent theming */
:root {
  /* Light theme colors */
  --primary-color: #667eea;        /* Main brand color (purple-blue) */
  --primary-hover: #5a6fd8;        /* Darker shade for hover effects */
  --secondary-color: #764ba2;      /* Secondary brand color (purple) */
  --accent-color: #f093fb;         /* Accent color (pink) */
  
  /* Background colors */
  --background-color: #f8fafc;     /* Page background (light gray) */
  --surface-color: #ffffff;        /* Card/component backgrounds */
  --card-background: #ffffff;      /* Specific card background */
  
  /* Text colors */
  --text-primary: #1a202c;         /* Main text color (dark) */
  --text-secondary: #4a5568;       /* Secondary text (medium gray) */
  --text-muted: #718096;           /* Muted text (light gray) */
  
  /* Status colors */
  --success-color: #48bb78;        /* Success messages (green) */
  --warning-color: #ed8936;        /* Warning messages (orange) */
  --error-color: #f56565;          /* Error messages (red) */
  --info-color: #4299e1;           /* Info messages (blue) */
  
  /* Border and shadow */
  --border-color: #e2e8f0;         /* Border color (light gray) */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);     /* Small shadow */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);   /* Medium shadow */
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1); /* Large shadow */
  
  /* Spacing system */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 3rem;      /* 48px */
  
  /* Border radius */
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  
  /* Typography */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-md: 1rem;       /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
}

/* Global reset and base styles */
* {
  margin: 0;                    /* Remove default margins */
  padding: 0;                   /* Remove default padding */
  box-sizing: border-box;       /* Include padding/border in width calculations */
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
               'Helvetica Neue', Arial, sans-serif;
  background-color: var(--background-color);
  color: var(--text-primary);
  line-height: 1.6;            /* Improve readability */
  -webkit-font-smoothing: antialiased;  /* Better font rendering */
  -moz-osx-font-smoothing: grayscale;
}

/* Container for layout */
.container {
  max-width: 1200px;           /* Maximum width */
  margin: 0 auto;              /* Center horizontally */
  padding: 0 var(--spacing-md); /* Side padding */
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
  font-size: var(--font-size-md);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  transform: translateY(-1px);  /* Subtle lift effect */
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--surface-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--background-color);
  border-color: var(--primary-color);
}

/* Card styles */
.card {
  background: var(--surface-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
}

/* Form styles */
.form-group {
  margin-bottom: var(--spacing-md);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Loading spinner */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-sm);
  }
  
  .card {
    padding: var(--spacing-md);
    margin: var(--spacing-sm) 0;
  }
  
  .btn {
    padding: 0.625rem 1.25rem;
    font-size: var(--font-size-sm);
  }
}

@media (max-width: 480px) {
  .card {
    padding: var(--spacing-sm);
  }
  
  .btn {
    padding: 0.5rem 1rem;
    width: 100%;
  }
}

/* Utility classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mt-1 { margin-top: var(--spacing-xs); }
.mt-2 { margin-top: var(--spacing-sm); }
.mt-3 { margin-top: var(--spacing-md); }
.mt-4 { margin-top: var(--spacing-lg); }

.mb-1 { margin-bottom: var(--spacing-xs); }
.mb-2 { margin-bottom: var(--spacing-sm); }
.mb-3 { margin-bottom: var(--spacing-md); }
.mb-4 { margin-bottom: var(--spacing-lg); }

.p-1 { padding: var(--spacing-xs); }
.p-2 { padding: var(--spacing-sm); }
.p-3 { padding: var(--spacing-md); }
.p-4 { padding: var(--spacing-lg); }
```

**Key concepts:**
- **CSS Variables**: Reusable values that make theming consistent
- **Design System**: Standardized colors, spacing, and typography
- **Global Reset**: Removes default browser styling for consistency
- **Utility Classes**: Reusable styles like `.btn` and `.card`
- **Responsive Design**: Adapts to different screen sizes
- **Component-based CSS**: Styles that match React component structure

#### `aws-exports.js` - AWS Configuration
**What it does:** Contains configuration settings for AWS Amplify authentication.

```javascript
const awsExports = {
  "aws_project_region": "us-east-1",              // AWS region
  "aws_cognito_region": "us-east-1",              // Cognito region
  "aws_user_pools_id": "us-east-1_xxxxxxxxx",     // User pool ID
  "aws_user_pools_web_client_id": "xxxxxxxxx",    // App client ID
  "oauth": {},
  "federationTarget": "COGNITO_USER_POOLS",
  "aws_cognito_username_attributes": ["email"],    // Use email as username
  "aws_cognito_social_providers": [],              // No social login
  "aws_cognito_signup_attributes": ["email"],      // Required signup fields
  "aws_cognito_mfa_configuration": "OFF",          // Multi-factor auth disabled
  "aws_cognito_mfa_types": ["SMS"],               // MFA type if enabled
  "aws_cognito_password_protection_settings": {
    "passwordPolicyMinLength": 8,                  // Minimum password length
    "passwordPolicyCharacters": []                 // Password requirements
  },
  "aws_cognito_verification_mechanisms": ["email"] // Verify via email
};

export default awsExports;
```

**Key concepts:**
- **User Pool**: AWS service for managing user accounts
- **Client ID**: Identifies our app to AWS Cognito
- **Configuration**: Settings that tell Amplify how to authenticate users
- **MFA**: Multi-Factor Authentication (additional security)

---

### 📁 components/ Directory - Reusable UI Building Blocks

#### `AccountsList.jsx` - Bank Accounts Display
**What it does:** Shows user's connected bank accounts with balances and account information.

```javascript
import React from 'react';

// Component that receives accounts data as props
const AccountsList = ({ accounts, loading }) => {
  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your accounts...</p>
      </div>
    );
  }

  // Show message if no accounts connected
  if (!accounts || accounts.length === 0) {
    return (
      <div className="empty-state card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            No Bank Accounts Connected
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Connect your bank account to get started with financial tracking
          </p>
        </div>
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

  // Determine account type color
  const getAccountTypeColor = (type) => {
    const colors = {
      'checking': 'var(--info-color)',
      'savings': 'var(--success-color)',
      'credit': 'var(--warning-color)',
      'investment': 'var(--primary-color)'
    };
    return colors[type] || 'var(--text-secondary)';
  };

  return (
    <div className="accounts-list">
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        Your Connected Accounts
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {accounts.map(account => (
          <div key={account.account_id} className="account-card card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Account Information */}
              <div className="account-info">
                <h4 style={{ 
                  color: 'var(--text-primary)', 
                  marginBottom: '0.25rem',
                  fontSize: '1.125rem'
                }}>
                  {account.name}
                </h4>
                <p style={{ 
                  color: getAccountTypeColor(account.subtype),
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  textTransform: 'capitalize'
                }}>
                  {account.subtype?.replace('_', ' ')} • ****{account.mask}
                </p>
                {account.official_name && (
                  <p style={{ 
                    color: 'var(--text-muted)', 
                    fontSize: '0.75rem',
                    marginTop: '0.25rem'
                  }}>
                    {account.official_name}
                  </p>
                )}
              </div>

              {/* Account Balances */}
              <div className="account-balance" style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700',
                  color: account.balances.current >= 0 ? 'var(--success-color)' : 'var(--error-color)'
                }}>
                  {formatCurrency(account.balances.current)}
                </div>
                
                {/* Available Balance (if different from current) */}
                {account.balances.available && 
                 account.balances.available !== account.balances.current && (
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem'
                  }}>
                    Available: {formatCurrency(account.balances.available)}
                  </div>
                )}
                
                {/* Credit Limit (for credit cards) */}
                {account.balances.limit && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem'
                  }}>
                    Limit: {formatCurrency(account.balances.limit)}
                  </div>
                )}
              </div>
            </div>
            
            {/* Account Status Indicator */}
            <div style={{
              marginTop: '1rem',
              padding: '0.5rem',
              backgroundColor: 'var(--background-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem'
            }}>
              <span style={{ color: 'var(--success-color)' }}>● </span>
              Connected & Active
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary Footer */}
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem',
        backgroundColor: 'var(--background-color)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Total Accounts: {accounts.length} • 
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default AccountsList;
```

**Key React concepts:**
- **Props**: Data passed from parent component (`accounts`, `loading`)
- **Conditional Rendering**: Show different content based on data state
- **Map Function**: Render list of accounts from array
- **Key Prop**: Unique identifier for list items (required by React)
- **Inline Styles**: CSS styles defined in JavaScript objects
- **Template Literals**: String interpolation with backticks

**UI/UX Features:**
- **Loading States**: Shows spinner while fetching data
- **Empty States**: Helpful message when no accounts exist
- **Currency Formatting**: Uses browser's Intl API for proper formatting
- **Visual Hierarchy**: Different font sizes and colors for importance
- **Status Indicators**: Shows connection status with color coding

#### `TransactionsList.jsx` - Transaction History Display
**What it does:** Shows transaction history with filtering, search, and PDF export capabilities.

```javascript
import React, { useState, useMemo } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import api from '../services/api';

const TransactionsList = ({ transactions, accounts, loading }) => {
  // State for filtering and UI
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Filter transactions based on user selections
  const filteredTransactions = useMemo(() => {
    let filtered = transactions || [];
    
    // Filter by account
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.account_id === selectedAccount
      );
    }
    
    // Filter by search term (merchant name or transaction name)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.name?.toLowerCase().includes(searchLower) ||
        transaction.merchant_name?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaction =>
        transaction.category?.[0] === selectedCategory
      );
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, selectedAccount, searchTerm, selectedCategory]);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const categorySet = new Set();
    transactions?.forEach(transaction => {
      if (transaction.category?.[0]) {
        categorySet.add(transaction.category[0]);
      }
    });
    return Array.from(categorySet).sort();
  }, [transactions]);

  // Format date for display
  const formatTransactionDate = (dateString) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  };

  // Handle PDF generation
  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Build query parameters for backend
      const params = new URLSearchParams();
      if (selectedAccount !== 'all') {
        params.append('account_id', selectedAccount);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
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
      
      // Show success message
      alert('PDF statement generated successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Get account name by ID
  const getAccountName = (accountId) => {
    const account = accounts?.find(acc => acc.account_id === accountId);
    return account?.name || 'Unknown Account';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="transactions-list">
      {/* Header with controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h3 style={{ color: 'var(--text-primary)' }}>Transaction History</h3>
        
        <button 
          onClick={generatePDF}
          disabled={isGeneratingPDF || filteredTransactions.length === 0}
          className="btn btn-secondary"
          style={{ opacity: isGeneratingPDF ? 0.7 : 1 }}
        >
          {isGeneratingPDF ? 'Generating...' : '📄 Export PDF'}
        </button>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: 'var(--background-color)',
        borderRadius: 'var(--radius-md)'
      }}>
        {/* Account Filter */}
        <div className="form-group">
          <label className="form-label">Filter by Account</label>
          <select 
            value={selectedAccount} 
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="form-input"
          >
            <option value="all">All Accounts</option>
            {accounts?.map(account => (
              <option key={account.account_id} value={account.account_id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="form-group">
          <label className="form-label">Search Transactions</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by merchant or description..."
            className="form-input"
          />
        </div>

        {/* Category Filter */}
        <div className="form-group">
          <label className="form-label">Filter by Category</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="empty-state card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            No Transactions Found
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {searchTerm || selectedCategory !== 'all' || selectedAccount !== 'all' 
              ? 'Try adjusting your filters to see more transactions.'
              : 'Connect your bank account to see your transaction history.'
            }
          </p>
        </div>
      ) : (
        <div className="transactions-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredTransactions.map(transaction => (
            <div key={transaction.transaction_id} className="transaction-item card" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem'
            }}>
              {/* Transaction Info */}
              <div className="transaction-info" style={{ flex: 1 }}>
                <h4 style={{ 
                  color: 'var(--text-primary)', 
                  marginBottom: '0.25rem',
                  fontSize: '1rem'
                }}>
                  {transaction.merchant_name || transaction.name}
                </h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ 
                    color: 'var(--text-muted)', 
                    fontSize: '0.875rem' 
                  }}>
                    {formatTransactionDate(transaction.date)}
                  </span>
                  
                  <span style={{ 
                    color: 'var(--text-muted)', 
                    fontSize: '0.875rem' 
                  }}>
                    {getAccountName(transaction.account_id)}
                  </span>
                  
                  {transaction.category?.[0] && (
                    <span style={{
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem'
                    }}>
                      {transaction.category[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Transaction Amount */}
              <div className="transaction-amount" style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: transaction.amount > 0 ? 'var(--error-color)' : 'var(--success-color)'
                }}>
                  {transaction.amount > 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                </div>
                
                {transaction.iso_currency_code && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem'
                  }}>
                    {transaction.iso_currency_code}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer with summary */}
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem',
        backgroundColor: 'var(--background-color)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Showing {filteredTransactions.length} of {transactions?.length || 0} transactions
        </p>
      </div>
    </div>
  );
};

export default TransactionsList;
```

**Key concepts:**
- **useState**: Manages component state (filters, loading states)
- **useMemo**: Optimizes expensive calculations (filtering, sorting)
- **Event Handlers**: Respond to user interactions (search, filter changes)
- **Blob API**: Handles file downloads for PDF generation
- **Query Parameters**: Send filter options to backend
- **Date Formatting**: Uses date-fns library for human-readable dates
- **Responsive Design**: Grid layout that adapts to screen size

**Advanced Features:**
- **Multiple Filters**: Account, search term, and category filtering
- **Real-time Search**: Instant filtering as user types
- **PDF Export**: Generate downloadable transaction statements
- **Smart Date Display**: Shows "Today", "Yesterday", or formatted date
- **Empty States**: Helpful messages when no data matches filters

---

#### `SpendingChart.jsx` - Data Visualization Component
**What it does:** Creates interactive pie charts and bar charts showing spending by category using Recharts library.

```javascript
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const SpendingChart = ({ 
  data, 
  title = "Spending by Category",
  chartType = "pie", // "pie" or "bar"
  height = 400 
}) => {
  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <div className="empty-chart card" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: height,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          No Data Available
        </h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Connect your bank account to see spending insights
        </p>
      </div>
    );
  }

  // Color palette for chart segments
  const COLORS = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', 
    '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'
  ];

  // Transform data for recharts format
  const chartData = data.map((item, index) => ({
    name: item.category || item.name,
    value: Math.abs(item.amount || item.value),
    count: item.count || 1,
    color: item.color || COLORS[index % COLORS.length],
    percentage: 0 // Will be calculated below
  }));

  // Calculate total and percentages
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  chartData.forEach(item => {
    item.percentage = ((item.value / total) * 100).toFixed(1);
  });

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div style={{
          backgroundColor: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <p style={{ 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            {data.name}
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            Amount: <span style={{ fontWeight: '600' }}>${data.value.toFixed(2)}</span>
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            Percentage: <span style={{ fontWeight: '600' }}>{data.percentage}%</span>
          </p>
          {data.count > 1 && (
            <p style={{ color: 'var(--text-secondary)' }}>
              Transactions: <span style={{ fontWeight: '600' }}>{data.count}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom label function for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    // Don't show labels for tiny slices
    if (percent < 0.05) return null;
    
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
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="spending-chart card">
      {/* Chart Title */}
      <h3 style={{ 
        textAlign: 'center',
        marginBottom: '1.5rem',
        color: 'var(--text-primary)',
        fontSize: '1.25rem'
      }}>
        {title}
      </h3>
      
      {/* Chart Container */}
      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'pie' ? (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={Math.min(height * 0.35, 120)}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '14px' }}
            />
          </PieChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="var(--primary-color)"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`bar-cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>

      {/* Chart Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: 'var(--background-color)',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
            ${total.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Total Spending
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--secondary-color)' }}>
            {chartData.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Categories
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-color)' }}>
            ${(total / chartData.length).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Avg per Category
          </div>
        </div>
      </div>

      {/* Top Categories List */}
      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Top Spending Categories
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {chartData
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
            .map((item, index) => (
              <div key={item.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: index === 0 ? 'var(--background-color)' : 'transparent',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: item.color
                  }}></div>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {item.name}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    ${item.value.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.percentage}%
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default SpendingChart;
```

**Key concepts:**
- **Recharts Library**: Professional charting library for React
- **ResponsiveContainer**: Makes charts adapt to container size
- **Custom Components**: Custom tooltip and label rendering
- **Data Transformation**: Converting our data format to chart format
- **Animation**: Smooth chart animations for better UX
- **Color Management**: Consistent color palette across charts

#### `BudgetManager.jsx` - Budget Creation and Tracking
**What it does:** Provides interface for creating, editing, and monitoring budgets with progress tracking.

```javascript
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const BudgetManager = ({ refreshTrigger }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: new Date().toISOString().slice(0, 7) // Current month YYYY-MM
  });
  const [submitting, setSubmitting] = useState(false);

  // Predefined categories for budget creation
  const CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Utilities',
    'Services',
    'Travel',
    'Education',
    'Other'
  ];

  // Fetch budgets from backend
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/budget');
      setBudgets(response.data.budgets || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update budget spending
  const updateBudgetSpending = async () => {
    try {
      await api.put('/budget/update-spending', {
        period: formData.period
      });
      fetchBudgets(); // Refresh budgets after update
    } catch (error) {
      console.error('Error updating budget spending:', error);
    }
  };

  // Create new budget
  const handleCreateBudget = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.limit) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/budget', formData);
      
      // Reset form and close
      setFormData({
        category: '',
        limit: '',
        period: new Date().toISOString().slice(0, 7)
      });
      setShowCreateForm(false);
      
      // Refresh budgets
      fetchBudgets();
      updateBudgetSpending();
      
    } catch (error) {
      console.error('Error creating budget:', error);
      alert('Failed to create budget. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete budget
  const handleDeleteBudget = async (budgetId) => {
    if (!confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await api.delete(`/budget/${budgetId}`);
      fetchBudgets(); // Refresh list
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget. Please try again.');
    }
  };

  // Calculate budget progress
  const getBudgetProgress = (budget) => {
    const spent = budget.spent || 0;
    const limit = budget.limit || 1;
    const percentage = Math.min((spent / limit) * 100, 100);
    const remaining = Math.max(limit - spent, 0);
    
    return {
      percentage,
      remaining,
      isOverBudget: spent > limit,
      status: percentage > 90 ? 'danger' : percentage > 75 ? 'warning' : 'good'
    };
  };

  // Get progress bar color
  const getProgressColor = (status) => {
    const colors = {
      good: 'var(--success-color)',
      warning: 'var(--warning-color)',
      danger: 'var(--error-color)'
    };
    return colors[status] || colors.good;
  };

  useEffect(() => {
    fetchBudgets();
    updateBudgetSpending();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading budgets...</p>
      </div>
    );
  }

  return (
    <div className="budget-manager">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ color: 'var(--text-primary)' }}>Budget Manager</h3>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'Cancel' : '+ Create Budget'}
        </button>
      </div>

      {/* Create Budget Form */}
      {showCreateForm && (
        <div className="create-budget-form card" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Create New Budget
          </h4>
          
          <form onSubmit={handleCreateBudget}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {/* Category Selection */}
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="form-input"
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Limit */}
              <div className="form-group">
                <label className="form-label">Monthly Limit *</label>
                <input
                  type="number"
                  value={formData.limit}
                  onChange={(e) => setFormData({...formData, limit: e.target.value})}
                  placeholder="Enter amount"
                  className="form-input"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Period */}
              <div className="form-group">
                <label className="form-label">Period</label>
                <input
                  type="month"
                  value={formData.period}
                  onChange={(e) => setFormData({...formData, period: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create Budget'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget List */}
      {budgets.length === 0 ? (
        <div className="empty-state card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💰</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            No Budgets Created
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Create your first budget to start tracking your spending limits
          </p>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {budgets.map(budget => {
            const progress = getBudgetProgress(budget);
            
            return (
              <div key={budget.id} className="budget-card card">
                {/* Budget Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h4 style={{ 
                      color: 'var(--text-primary)', 
                      marginBottom: '0.25rem',
                      fontSize: '1.125rem'
                    }}>
                      {budget.category}
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {budget.period} • Monthly Budget
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--error-color)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: 'var(--radius-sm)'
                    }}
                    title="Delete Budget"
                  >
                    🗑️
                  </button>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--background-color)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progress.percentage}%`,
                      height: '100%',
                      backgroundColor: (budget.spent / budget.limit) > 0.9 
                        ? 'var(--error-color)' 
                        : 'var(--success-color)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                {/* Budget Details */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      ${(budget.spent || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Spent
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--secondary-color)' }}>
                      ${budget.limit.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Budget
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: progress.isOverBudget ? 'var(--error-color)' : 'var(--success-color)'
                    }}>
                      ${progress.remaining.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {progress.isOverBudget ? 'Over Budget' : 'Remaining'}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700', 
                      color: getProgressColor(progress.status)
                    }}>
                      {progress.percentage.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Used
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                {progress.isOverBudget && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(245, 101, 101, 0.1)',
                    borderLeft: '4px solid var(--error-color)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <p style={{ color: 'var(--error-color)', fontSize: '0.875rem', margin: 0 }}>
                      ⚠️ You've exceeded your budget by ${(budget.spent - budget.limit).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button 
          onClick={updateBudgetSpending}
          className="btn btn-secondary"
        >
          🔄 Refresh Budget Data
        </button>
      </div>
    </div>
  );
};

export default BudgetManager;
```

**Key concepts:**
- **State Management**: Multiple useState hooks for different data pieces
- **Form Handling**: Controlled components with validation
- **API Integration**: CRUD operations for budgets
- **Progress Calculation**: Math for budget usage percentages
- **Conditional Styling**: Dynamic colors based on budget status
- **User Experience**: Loading states, confirmations, and feedback

---

#### `InsightsPanel.jsx` - AI-Powered Financial Insights
**What it does:** Provides intelligent financial insights and recommendations based on spending patterns.

```javascript
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const InsightsPanel = ({ refreshTrigger }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState(null);

  // Fetch insights from backend
  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await api.get('/insights');
      setInsights(response.data.insights || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  // Insight types with icons and colors
  const INSIGHT_TYPES = {
    savings: { icon: '💰', color: 'var(--success-color)', label: 'Savings Opportunity' },
    warning: { icon: '⚠️', color: 'var(--warning-color)', label: 'Budget Alert' },
    trend: { icon: '📈', color: 'var(--primary-color)', label: 'Spending Trend' },
    goal: { icon: '🎯', color: 'var(--accent-color)', label: 'Goal Progress' },
    tip: { icon: '💡', color: 'var(--info-color)', label: 'Money Tip' }
  };

  // Get insight style based on type
  const getInsightStyle = (type) => {
    return INSIGHT_TYPES[type] || INSIGHT_TYPES.tip;
  };

  // Mark insight as read
  const markAsRead = async (insightId) => {
    try {
      await api.put(`/insights/${insightId}/read`);
      setInsights(insights.map(insight => 
        insight.id === insightId ? { ...insight, read: true } : insight
      ));
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  // Dismiss insight
  const dismissInsight = async (insightId) => {
    try {
      await api.delete(`/insights/${insightId}`);
      setInsights(insights.filter(insight => insight.id !== insightId));
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="insights-panel">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-panel">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ color: 'var(--text-primary)' }}>Financial Insights</h3>
        <button 
          onClick={fetchInsights}
          className="btn btn-secondary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          🔄 Refresh
        </button>
      </div>

      {insights.length === 0 ? (
        <div className="empty-state card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            No Insights Available
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Connect your accounts and start spending to receive personalized financial insights
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {insights.map(insight => {
            const style = getInsightStyle(insight.type);
            
            return (
              <div 
                key={insight.id}
                className={`insight-card card ${!insight.read ? 'unread' : ''}`}
                style={{
                  borderLeft: `4px solid ${style.color}`,
                  position: 'relative'
                }}
              >
                {/* New indicator */}
                {!insight.read && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-color)'
                  }}></div>
                )}

                {/* Insight Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>{style.icon}</span>
                  <div>
                    <h4 style={{ 
                      color: 'var(--text-primary)', 
                      fontSize: '1rem',
                      margin: 0
                    }}>
                      {insight.title}
                    </h4>
                    <p style={{ 
                      color: style.color, 
                      fontSize: '0.75rem',
                      margin: 0,
                      fontWeight: '600'
                    }}>
                      {style.label}
                    </p>
                  </div>
                </div>

                {/* Insight Content */}
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  lineHeight: 1.5,
                  marginBottom: '1rem'
                }}>
                  {insight.description}
                </p>

                {/* Insight Details */}
                {insight.details && (
                  <div style={{
                    backgroundColor: 'var(--background-color)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1rem'
                  }}>
                    <pre style={{ 
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap',
                      margin: 0
                    }}>
                      {insight.details}
                    </pre>
                  </div>
                )}

                {/* Recommended Action */}
                {insight.action && (
                  <div style={{
                    backgroundColor: `${style.color}15`,
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ 
                      color: style.color,
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      margin: 0
                    }}>
                      💡 Recommended Action: {insight.action}
                    </p>
                  </div>
                )}

                {/* Impact Score */}
                {insight.impact && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Potential Impact:
                    </span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(level => (
                        <div
                          key={level}
                          style={{
                            width: '16px',
                            height: '4px',
                            backgroundColor: level <= insight.impact 
                              ? style.color 
                              : 'var(--border-color)',
                            borderRadius: '2px'
                          }}
                        ></div>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: style.color, fontWeight: '600' }}>
                      {insight.impact === 5 ? 'High' : 
                       insight.impact >= 3 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem',
                  justifyContent: 'flex-end'
                }}>
                  {!insight.read && (
                    <button
                      onClick={() => markAsRead(insight.id)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.75rem',
                        backgroundColor: 'transparent',
                        border: `1px solid ${style.color}`,
                        color: style.color,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer'
                      }}
                    >
                      Mark as Read
                    </button>
                  )}
                  
                  <button
                    onClick={() => dismissInsight(insight.id)}
                    style={{
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    Dismiss
                  </button>
                </div>

                {/* Timestamp */}
                <div style={{ 
                  textAlign: 'right',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  {new Date(insight.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;
```

**Key concepts:**
- **Dynamic Styling**: Conditional styles based on insight type
- **User Interactions**: Mark as read, dismiss functionality
- **Data Visualization**: Impact scores with visual indicators
- **Content Organization**: Structured layout for complex data
- **State Updates**: Optimistic UI updates

---

### 📁 pages/ Directory - Main Application Pages

#### `DashboardPage.jsx` - Main Dashboard Interface
**What it does:** The main dashboard that brings together all components and provides the central user interface.

```javascript
import React, { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getCurrentUser } from 'aws-amplify/auth';
import AccountsList from '../components/AccountsList';
import TransactionsList from '../components/TransactionsList';
import SpendingChart from '../components/SpendingChart';
import BudgetManager from '../components/BudgetManager';
import InsightsPanel from '../components/InsightsPanel';
import PlaidLinkButton from '../components/PlaidLinkButton';
import PlaidProvider from '../components/PlaidProvider';
import SessionManager from '../components/SessionManager';
import useSessionSecurity from '../hooks/useSessionSecurity';
import api from '../services/api';

const DashboardPage = () => {
  // Authentication state
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  
  // Session security hook
  const { 
    sessionWarning, 
    handleLogout, 
    extendSession, 
    SessionWarningDialog 
  } = useSessionSecurity(user);

  // Dashboard state
  const [dashboardData, setDashboardData] = useState({
    accounts: [],
    transactions: [],
    spendingData: [],
    budgets: [],
    insights: []
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState(null);

  // Available tabs
  const TABS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'accounts', label: 'Accounts', icon: '🏦' },
    { id: 'transactions', label: 'Transactions', icon: '💳' },
    { id: 'budgets', label: 'Budgets', icon: '💰' },
    { id: 'insights', label: 'Insights', icon: '🧠' }
  ];

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUserProfile(currentUser);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        accountsResponse,
        transactionsResponse,
        spendingResponse,
        budgetsResponse,
        insightsResponse
      ] = await Promise.all([
        api.get('/accounts'),
        api.get('/transactions'),
        api.get('/spending/categories'),
        api.get('/budget'),
        api.get('/insights')
      ]);

      setDashboardData({
        accounts: accountsResponse.data.accounts || [],
        transactions: transactionsResponse.data.transactions || [],
        spendingData: spendingResponse.data.categories || [],
        budgets: budgetsResponse.data.budgets || [],
        insights: insightsResponse.data.insights || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchDashboardData();
  };

  // Handle account connection success
  const handleAccountConnected = () => {
    console.log('Account connected successfully');
    refreshData();
  };

  // Calculate dashboard metrics
  const calculateMetrics = () => {
    const { accounts, transactions, budgets } = dashboardData;
    
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const monthlySpending = transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        const now = new Date();
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
    const budgetUsed = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
    const budgetRemaining = totalBudget - budgetUsed;

    return {
      totalBalance,
      monthlySpending,
      totalBudget,
      budgetUsed,
      budgetRemaining,
      budgetUtilization: totalBudget > 0 ? (budgetUsed / totalBudget) * 100 : 0
    };
  };

  const metrics = calculateMetrics();

  // Load data on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchDashboardData();
  }, [refreshTrigger]);

  // Show loading state
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your financial dashboard...</p>
        </div>
    // event.preventDefault();
    // event.returnValue = '';
  }, []);

  // Setup session monitoring
  useEffect(() => {
    if (!user) return;

    // Create session marker
    createSessionMarker();
    
    // Initial activity update
    updateLastActivity();
    
    // Setup activity tracking
    const cleanupActivityTracking = setupActivityTracking();
    
    // Session check interval
    const sessionCheckInterval = setInterval(checkSessionStatus, SESSION_SETTINGS.CHECK_INTERVAL);
    
    // Event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup function
    return () => {
      cleanupActivityTracking();
      clearInterval(sessionCheckInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, checkSessionStatus, handleVisibilityChange, handleBeforeUnload]);

  // Session warning dialog component
  const SessionWarningDialog = useCallback(() => {
    if (!sessionWarning) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{
          backgroundColor: 'var(--surface-color)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            color: 'var(--warning-color)', 
            marginBottom: '1rem',
            fontSize: '1.25rem'
          }}>
            ⚠️ Session Expiring Soon
          </h3>
          
          <p style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '1.5rem',
            lineHeight: 1.5
          }}>
            Your session will expire in{' '}
            <strong style={{ color: 'var(--warning-color)' }}>
              {formatTimeRemaining(timeRemaining)}
            </strong>.
            {' '}Would you like to extend your session?
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={extendSession}
              className="btn btn-primary"
            >
              Extend Session
            </button>
            <button 
              onClick={() => handleLogout('manual')}
              className="btn btn-secondary"
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    );
  }, [sessionWarning, timeRemaining, extendSession, handleLogout]);

  return {
    sessionWarning,
    timeRemaining,
    isLoggingOut,
    extendSession,
    handleLogout,
    SessionWarningDialog,
    formatTimeRemaining: (ms) => formatTimeRemaining(ms || timeRemaining)
  };
};

export default useSessionSecurity;
```

**Key concepts:**
- **Custom Hooks**: Reusable stateful logic
- **useCallback**: Memoized functions to prevent unnecessary re-renders
- **useEffect**: Side effects and cleanup
- **Event Listeners**: Browser API integration
- **Session Management**: Security-focused user session handling
- **Component Returns**: Hooks can return both data and components

---

This comprehensive README provides detailed explanations of every file in the client directory, covering React concepts, modern frontend development practices, security considerations, and user experience design. Each file explanation includes code examples, key concepts, and practical implementation details suitable for developers of all skill levels.
