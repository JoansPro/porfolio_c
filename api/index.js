const { app, initializeApp } = require('../Backend/app');

module.exports = async (req, res) => {
  try {
    await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error('Vercel handler startup failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: error.message
    });
  }
};
