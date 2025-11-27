/**
 * @fileoverview Notes Controller - Handles CRUD operations for notes
 * @module controllers/notesController
 */

import Note from "../models/Note.js";

/**
 * Get all notes for the authenticated user
 * Returns notes sorted by creation date (newest first)
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object (from auth middleware)
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with notes array or error message
 * 
 * @example
 * GET /api/notes
 * Response: [{ _id: "123", title: "Note", content: "..." }, ...]
 */
export async function getAllNotes(req, res) {
  try {
    // Use lean() to return plain JavaScript objects instead of Mongoose documents
    // This improves performance by 2-5x
    const notes = await Note.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // -1 for descending order (newest first)
      .lean();

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error in getAllNotes controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get a single note by ID
 * Only returns note if it belongs to the authenticated user
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Note ID
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with note object or error message
 * 
 * @example
 * GET /api/notes/:id
 * Response: { _id: "123", title: "Note", content: "...", user: "456" }
 */
export async function getNoteById(req, res) {
  try {
    // Find note by ID and ensure it belongs to current user
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id
    }).lean();

    if (!note) {
      return res.status(404).json({ message: "Note not found!" });
    }

    res.json(note);
  } catch (error) {
    console.error("Error in getNoteById controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Create a new note
 * Associates note with the authenticated user
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - Note title
 * @param {string} req.body.content - Note content
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with created note or error message
 * 
 * @example
 * POST /api/notes
 * Body: { title: "New Note", content: "Content..." }
 * Response: { _id: "123", title: "New Note", content: "...", user: "456" }
 */
export async function createNote(req, res) {
  try {
    const { title, content } = req.body;

    // Create new note instance
    const note = new Note({
      title,
      content,
      user: req.user.id
    });

    // Save to database
    const savedNote = await note.save();

    // Convert to plain object for response
    res.status(201).json(savedNote.toObject());
  } catch (error) {
    console.error("Error in createNote controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Update an existing note
 * Only updates note if it belongs to the authenticated user
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Note ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - Updated note title
 * @param {string} req.body.content - Updated note content
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with updated note or error message
 * 
 * @example
 * PUT /api/notes/:id
 * Body: { title: "Updated Title", content: "Updated content..." }
 * Response: { _id: "123", title: "Updated Title", content: "...", user: "456" }
 */
export async function updateNote(req, res) {
  try {
    const { title, content } = req.body;

    // Find and update note in one operation
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Filter: match ID and user
      { title, content }, // Update
      {
        new: true,  // Return updated document
        lean: true  // Return plain object for better performance
      }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error("Error in updateNote controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Delete a note
 * Only deletes note if it belongs to the authenticated user
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - Note ID
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - User ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with success message or error
 * 
 * @example
 * DELETE /api/notes/:id
 * Response: { message: "Note deleted successfully!" }
 */
export async function deleteNote(req, res) {
  try {
    // Find and delete note in one operation
    const deletedNote = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    }).lean();

    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteNote controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}