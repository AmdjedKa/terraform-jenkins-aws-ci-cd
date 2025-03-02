const express = require('express');
const authRoutes = require('./routes/auth.routes');
const { sequelize } = require('./config/database');

const app = express();

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Database connection
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database');
    
    // Sync database models
    await sequelize.sync();
    console.log('Database models synchronized');
  } catch (error) {
    console.log('Database connection error:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3001;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });
});
