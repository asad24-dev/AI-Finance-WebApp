// routes/budgetRoutes.js
const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { verifyToken: authMiddleware } = require('../middleware/authMiddleware');

// Helper routes (no auth required for categories)
router.get('/categories', budgetController.getBudgetCategories);

// Apply auth middleware to protected routes
router.use(authMiddleware);

// Budget CRUD routes
router.post('/', budgetController.createBudget);
router.get('/', budgetController.getBudgets);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
