/**
 * @fileoverview User Model - Mongoose schema for user accounts
 * @module models/User
 */

import mongoose from 'mongoose';

/**
 * User Schema
 * Defines the structure for user documents in MongoDB
 * 
 * @typedef {Object} UserSchema
 * @property {string} username - Unique username (min 3 chars, required)
 * @property {string} password - Hashed password (min 6 chars, required, not returned in queries)
 * @property {Date} createdAt - Account creation timestamp (auto-generated)
 * @property {Date} updatedAt - Last update timestamp (auto-generated)
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,  // Automatically creates a unique index in MongoDB
    trim: true,    // Remove whitespace from both ends
    minlength: 3   // Minimum username length
  },
  password: {
    type: String,
    required: true,
    minlength: 6,     // Minimum password length
    select: false     // Don't include password in query results by default (security feature)
  }
}, {
  timestamps: true    // Automatically add createdAt and updatedAt fields
});

/**
 * User Model
 * Compiled model from userSchema
 * 
 * Note: Password field must be explicitly selected using .select('+password')
 * when needed for authentication
 * 
 * @type {mongoose.Model}
 */
const User = mongoose.model('User', userSchema);

export default User;


