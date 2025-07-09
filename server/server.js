// server/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const plaidRoutes = require('./routes/plaidRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

const { verifyToken } = require('./middleware/authMiddleware');

const sequelize = require('./config/database');
require('./models/User');
require('./models/Item');
require('./models/Budget');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Public route' });
});

app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.email}, you are authenticated!` });
});

app.use('/api/plaid', plaidRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budgets', budgetRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected successfully.');
    await sequelize.sync({ alter: true }); // Use alter instead of force to preserve existing data
    console.log('✅ DB tables synchronized.');
  } catch (err) {
    console.error('❌ DB connection error:', err);
  }
});