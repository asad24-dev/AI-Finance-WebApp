// server/routes/plaidRoutes.js
import express from 'express';
import { createLinkToken, exchangePublicToken, getAccounts, getTransactions } from '../controllers/plaidController.js';
import { verifyToken as requireAuth } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/create-link-token', requireAuth, createLinkToken);
router.post('/exchange-public-token', requireAuth, exchangePublicToken);
router.get('/accounts', requireAuth, getAccounts);
router.get('/transactions', requireAuth, getTransactions);
export default router;
