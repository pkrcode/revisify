import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
export const signupController = async (req, res) => {
  // 1. Check for validation errors from the route middleware
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // 2. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // 3. Create a new user instance (password will be hashed by the pre-save hook in the model)
    user = new User({
      name,
      email,
      password,
    });

    // 4. Save the user to the database
    await user.save();

    // 5. Send a success response
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error('Signup Error:', error.message);
    res.status(500).json({ message: 'Server error during user registration' });
  }
};


/**
 * @desc    Authenticate user & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginController = async (req, res) => {
  // 1. Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // 2. Check if user exists, and explicitly select the password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Use a generic message for security (don't reveal if the email exists or not)
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Compare submitted password with the stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 4. Create JWT payload
    const payload = {
      user: {
        id: user.id, // Mongoose provides a virtual 'id' getter for '_id'
      },
    };

    // 5. Sign the token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};