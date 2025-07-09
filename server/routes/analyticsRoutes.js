// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(verifyToken);

// Analytics routes
router.get('/spending', analyticsController.getSpendingAnalytics);
router.get('/spending/comparison', analyticsController.getSpendingComparison);
router.get('/budget-analysis', analyticsController.getBudgetAnalysis);

module.exports = router;
