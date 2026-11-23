// middleware/auth.js – JWT authentication & role guard middleware
const jwt = require('jsonwebtoken');

/**
 * verifyToken – protects any route that requires a logged-in user
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * requireAdmin – restricts route to admin users only
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
  next();
};

/**
 * requireStudent – restricts route to student users only
 */
const requireStudent = (req, res, next) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Access denied. Students only.' });
  }
  next();
};

module.exports = { verifyToken, requireAdmin, requireStudent };
