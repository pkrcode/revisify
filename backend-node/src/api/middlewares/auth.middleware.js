import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

/**
 * Middleware to protect routes that require authentication.
 * It verifies the JWT from the Authorization header.
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and is correctly formatted
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token's payload and attach it to the request object
      // We exclude the password from the user object that gets attached
      req.user = await User.findById(decoded.user.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware/controller
    } catch (error) {
      console.error('Authentication Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
