const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./db/connection');
const { bootstrapDatabase } = require('./db/bootstrap');

dotenv.config();

const app = express();
const frontendRoot = path.join(__dirname, '..');

let initializationPromise = null;

function configureApp() {
  app.use(cors());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/api', require('./routes'));
  app.use(express.static(frontendRoot));

  app.get('/api/health', (req, res) => {
    res.json({
      message: 'Portfolio Backend is running',
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/admin', (req, res) => {
    res.sendFile(path.join(frontendRoot, 'adminporfollo.html'));
  });

  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    return res.sendFile(path.join(frontendRoot, 'index.html'));
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  });
}

configureApp();

async function initializeApp() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      await connectDB();
      await bootstrapDatabase();
      console.log('MongoDB bootstrap completed');
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

module.exports = {
  app,
  initializeApp
};
