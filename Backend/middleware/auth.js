const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied'
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here');
    req.user = verified;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
