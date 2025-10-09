import { Router } from 'express';
import { body } from 'express-validator';
import { signupController, loginController } from '../controllers/auth.controller.js';

const router = Router();

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/signup',
  [
    // Validation middleware for the signup route
    body('name', 'Name is required and cannot be empty').not().isEmpty().trim(),
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required and must be at least 6 characters long').isLength({ min: 6 }),
  ],
  signupController
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate a user and get a token
 * @access  Public
 */
router.post(
  '/login',
  [
    // Validation middleware for the login route
    body('email', 'Please include a valid email').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists(),
  ],
  loginController
);

export default router;