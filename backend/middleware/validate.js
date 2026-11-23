// middleware/validate.js – Simple input validation helpers
const validate = {
  /**
   * Checks that all required fields are present in req.body.
   * Returns 400 if any are missing.
   */
  required: (fields) => (req, res, next) => {
    const missing = fields.filter(f => {
      const val = req.body[f];
      return val === undefined || val === null || String(val).trim() === '';
    });
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }
    next();
  },

  /** Validates email format */
  email: (req, res, next) => {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }
    next();
  },

  /** Validates password length */
  password: (req, res, next) => {
    const { password } = req.body;
    if (password && password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }
    next();
  },
};

module.exports = validate;
