// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import plaidRoutes from './routes/plaidRoutes.js';


import { verifyToken } from './middleware/authMiddleware.js';

import sequelize from './config/database.js';
import './models/User.js';
import './models/Item.js';



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

app.listen(3001, () => console.log('Server running on port 3001'));
try {
  await sequelize.authenticate();
  console.log('✅ DB connected successfully.');
  await sequelize.sync({ alter: true }); // auto-create/update tables
} catch (err) {
  console.error('❌ DB connection error:', err);
}