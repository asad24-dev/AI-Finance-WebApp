// server/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const plaidRoutes = require('./routes/plaidRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

const { verifyToken } = require('./middleware/authMiddleware');

// Load environment variables - only if .env file exists (for local development)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const sequelize = require('./config/database');
require('./models/User');
require('./models/Item');
require('./models/Budget');

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Public route' });
});

app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.email}, you are authenticated!` });
});

app.use('/plaid', plaidRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/budget', budgetRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    console.log('🔄 Attempting database connection...');
    await sequelize.authenticate();
    console.log('✅ DB connected successfully.');
    
    console.log('🔄 Synchronizing database tables...');
    await sequelize.sync({ alter: true }); // Use alter instead of force to preserve existing data
    console.log('✅ DB tables synchronized.');
  } catch (err) {
    console.error('❌ DB connection error:', err);
    console.error('❌ Error details:', err.message);
    console.error('❌ Error code:', err.code);
  }
});