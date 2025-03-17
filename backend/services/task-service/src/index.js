const express = require('express');
const { sequelize } = require('./config/database');
const taskRoutes = require('./routes/task.routes');
const { logger } = require('./utils/logger');

const app = express();

app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Database connection
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connected to PostgreSQL database');
    
    // Sync database models
    await sequelize.sync();
    logger.info('Database models synchronized');
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3003;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    logger.info(`Task service running on port ${PORT}`);
  });
});
