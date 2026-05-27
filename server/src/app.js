const express = require('express');
const cors = require('cors');

const authRoutes     = require('./routes/auth');
const readingRoutes  = require('./routes/readings');
const buildingRoutes = require('./routes/buildings');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// Routes
app.use('/api/auth',      authRoutes);
app.use('/api/readings',  readingRoutes);
app.use('/api/buildings', buildingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;



