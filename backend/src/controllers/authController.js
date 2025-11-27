/**
 * @fileoverview Authentication Controller - Handles user registration and login
 * @module controllers/authController
 */

import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Register a new user
 * Creates a new user account with hashed password
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Desired username (min 3 characters)
 * @param {string} req.body.password - Desired password (min 6 characters)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with success message or error
 * 
 * @example
 * POST /api/auth/register
 * Body: { username: "john_doe", password: "password123" }
 * Response: { message: "User registered successfully" }
 */
export const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required'
            });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                message: 'Username already exists'
            });
        }

        // Hash password with bcrypt (10 rounds provides good security/performance balance)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user instance
        const newUser = new User({
            username,
            password: hashedPassword
        });

        // Save user to database
        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
};

/**
 * Authenticate user and generate JWT token
 * Validates credentials and returns authentication token
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Username
 * @param {string} req.body.password - Password
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with token and user data or error
 * 
 * @example
 * POST /api/auth/login
 * Body: { username: "john_doe", password: "password123" }
 * Response: { 
 *   token: "eyJhbGc...", 
 *   user: { id: "123", username: "john_doe" } 
 * }
 */
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required'
            });
        }

        // Find user and explicitly select password field
        // (password has select: false in schema for security)
        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            // Use generic message to prevent username enumeration
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        // Verify password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET || 'default_secret_key', // Use environment variable in production
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Return token and sanitized user data (no password)
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Server error'
        });
    }
};

