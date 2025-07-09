// server/controllers/plaidController.js
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import dotenv from 'dotenv';
import Item from '../models/Item.js';
import User from '../models/User.js';
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

export const createLinkToken = async (req, res) => {
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

export const exchangePublicToken = async (req, res) => {
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

export const getAccounts = async (req, res) => {
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

export const getTransactions = async (req, res) => {
  try {
    const userSub = req.user.sub;

    // Get access_token from DB
    const item = await Item.findOne({ where: { userSub } });
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const response = await plaidClient.transactionsSync({
      access_token: item.access_token,
      cursor: '', // Start from beginning for initial sync
      count: 100, // Optional: limit number of transactions
    });

    res.json({
      transactions: response.data.added,
      accounts: response.data.accounts,
      total_transactions: response.data.added.length,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch transactions', error });
  }
};