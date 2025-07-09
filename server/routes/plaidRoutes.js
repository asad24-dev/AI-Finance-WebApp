// server/routes/plaidRoutes.js
const express = require('express');
const { createLinkToken, exchangePublicToken, getAccounts, getTransactions } = require('../controllers/plaidController');
const { verifyToken: requireAuth } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/create-link-token', requireAuth, createLinkToken);
router.post('/exchange-public-token', requireAuth, exchangePublicToken);
router.get('/accounts', requireAuth, getAccounts);
router.get('/transactions', requireAuth, getTransactions);

module.exports = router;
