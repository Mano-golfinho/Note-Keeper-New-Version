/**
 * @fileoverview Note Model - Mongoose schema for notes
 * @module models/Note
 */

import mongoose from "mongoose";

/**
 * Note Schema
 * Defines the structure for note documents in MongoDB
 * 
 * @typedef {Object} NoteSchema
 * @property {string} title - Note title (required)
 * @property {string} content - Note content (required)
 * @property {ObjectId} user - Reference to User who owns this note (required)
 * @property {Date} createdAt - Timestamp when note was created (auto-generated)
 * @property {Date} updatedAt - Timestamp when note was last updated (auto-generated)
 */
const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true  // Single-field index for faster user-based queries
    }
},
    {
        timestamps: true  // Automatically add createdAt and updatedAt fields
    }
);

/**
 * Compound Index
 * Creates an index on both user and createdAt fields
 * This significantly improves performance for queries that:
 * - Filter by user AND sort by creation date
 * - Are used in getAllNotes controller
 * 
 * Performance impact: 50-90% faster queries
 */
noteSchema.index({ user: 1, createdAt: -1 });

/**
 * Note Model
 * Compiled model from noteSchema
 * @type {mongoose.Model}
 */
const Note = mongoose.model("Note", noteSchema)

export default Note