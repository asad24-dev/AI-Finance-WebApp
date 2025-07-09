// server/controllers/plaidController.js
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const dotenv = require('dotenv');
const Item = require('../models/Item');
const User = require('../models/User');
const PDFDocument = require('pdfkit');
dotenv.config();

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

const createLinkToken = async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: req.user.sub, // or any unique user ID
      },
      client_name: 'Finance App',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
    });
    res.json(response.data);
  } catch (err) {
    console.error('Error creating link token:', err);
    res.status(500).json({ error: 'Failed to create link token' });
  }
};

const exchangePublicToken = async (req, res) => {
  try {
    const { public_token } = req.body;
    const response = await plaidClient.itemPublicTokenExchange({ public_token });

    const { access_token, item_id } = response.data;

    // Store user (if doesn't exist)
    await User.findOrCreate({
      where: { sub: req.user.sub },
      defaults: { email: req.user.email },
    });

    // Store item
    await Item.create({
      item_id,
      access_token,
      userSub: req.user.sub,
    });

    res.json({ access_token, item_id });
  } catch (err) {
    console.error('Error saving token:', err);
    res.status(500).json({ error: 'Failed to exchange public token' });
  }
};

const getAccounts = async (req, res) => {
  try {
    const userSub = req.user.sub;

    // Get access_token from DB
    const item = await Item.findOne({ where: { userSub } });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const response = await plaidClient.accountsBalanceGet({ access_token: item.access_token });

    res.json({ accounts: response.data.accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch accounts', error });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userSub = req.user.sub;
    const { accountId } = req.query; // Optional account filter

    // Get access_token from DB
    const item = await Item.findOne({ where: { userSub } });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const response = await plaidClient.transactionsSync({
      access_token: item.access_token,
      cursor: '', // Start from beginning for initial sync
      count: 100, // Optional: limit number of transactions
    });

    let transactions = response.data.added;
    
    // Filter by account if specified
    if (accountId) {
      transactions = transactions.filter(tx => tx.account_id === accountId);
    }

    res.json({
      transactions,
      accounts: response.data.accounts,
      total_transactions: transactions.length,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch transactions', error });
  }
};

const generateTransactionStatement = async (req, res) => {
  try {
    const userSub = req.user.sub;
    const { accountId, startDate, endDate } = req.query;

    // Get access_token from DB
    const item = await Item.findOne({ where: { userSub } });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Get user information
    const user = await User.findOne({ where: { sub: userSub } });
    const userName = user ? user.name || user.email : 'Account Holder';

    const response = await plaidClient.transactionsSync({
      access_token: item.access_token,
      cursor: '',
      count: 500, // Get more transactions for statement
    });

    let transactions = response.data.added;
    const accounts = response.data.accounts;

    // Filter by account if specified
    if (accountId) {
      transactions = transactions.filter(tx => tx.account_id === accountId);
    }

    // Filter by date range if specified
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date('2000-01-01');
      const end = endDate ? new Date(endDate) : new Date();
      transactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= start && txDate <= end;
      });
    }

    // Sort transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="transaction-statement-${Date.now()}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Transaction Statement', { align: 'center' });
    doc.moveDown(0.5);
    
    // Account holder info
    doc.fontSize(12)
       .text(`Account Holder: ${userName}`, { align: 'left' })
       .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'left' })
       .moveDown(0.5);

    // Account information
    const filteredAccounts = accountId 
      ? accounts.filter(acc => acc.account_id === accountId)
      : accounts;

    doc.text('Account Information:', { underline: true });
    filteredAccounts.forEach(account => {
      doc.text(`• ${account.name} (${account.subtype}) - ****${account.account_id.slice(-4)}`)
         .text(`  Current Balance: ${formatCurrency(account.balances.current)}`)
         .moveDown(0.3);
    });

    doc.moveDown(0.5);

    // Transaction summary
    const totalDebits = transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
    const totalCredits = transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    doc.text('Transaction Summary:', { underline: true })
       .text(`Total Transactions: ${transactions.length}`)
       .text(`Total Debits: ${formatCurrency(totalDebits)}`)
       .text(`Total Credits: ${formatCurrency(totalCredits)}`)
       .moveDown(0.5);

    // Transactions table header
    doc.text('Transaction Details:', { underline: true });
    doc.moveDown(0.3);

    // Table headers
    const startY = doc.y;
    doc.fontSize(10);
    doc.text('Date', 50, startY, { width: 80 });
    doc.text('Description', 130, startY, { width: 200 });
    doc.text('Category', 330, startY, { width: 100 });
    doc.text('Amount', 430, startY, { width: 80, align: 'right' });
    doc.text('Account', 510, startY, { width: 80 });
    
    // Draw line under headers
    doc.moveTo(50, startY + 15).lineTo(590, startY + 15).stroke();
    
    let currentY = startY + 25;
    
    // Add transactions
    transactions.forEach((transaction, index) => {
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      const account = accounts.find(acc => acc.account_id === transaction.account_id);
      const accountName = account ? account.name : 'Unknown';
      
      doc.text(new Date(transaction.date).toLocaleDateString(), 50, currentY, { width: 80 });
      doc.text(transaction.merchant_name || transaction.name || 'Unknown', 130, currentY, { width: 200 });
      doc.text(transaction.category?.[0] || 'Other', 330, currentY, { width: 100 });
      
      const amount = transaction.amount > 0 ? `-${formatCurrency(transaction.amount)}` : `+${formatCurrency(Math.abs(transaction.amount))}`;
      doc.text(amount, 430, currentY, { width: 80, align: 'right' });
      doc.text(accountName, 510, currentY, { width: 80 });
      
      currentY += 20;
      
      // Add subtle line between transactions
      if (index < transactions.length - 1) {
        doc.moveTo(50, currentY - 5).lineTo(590, currentY - 5).stroke('#E0E0E0');
      }
    });

    // Footer
    doc.fontSize(8)
       .text('This statement is generated from your connected financial accounts.', 50, doc.page.height - 100, { align: 'center' })
       .text('All amounts are in USD.', 50, doc.page.height - 85, { align: 'center' });

    doc.end();
    
  } catch (error) {
    console.error('Error generating statement:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to generate statement', error });
  }
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

module.exports = {
  createLinkToken,
  exchangePublicToken,
  getAccounts,
  getTransactions,
  generateTransactionStatement
};