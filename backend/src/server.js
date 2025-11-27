/**
 * @fileoverview Express Server Configuration
 * @module server
 * Main application entry point for the Think Board backend
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import notesRoutes from "./routes/notesRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5001;

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Middleware Configuration
 * Order is important: CORS → JSON Parser → Rate Limiter → Routes
 */

// CORS Configuration
// Allow cross-origin requests in development, restrict in production
if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173", // Vite dev server default port
    })
  );
}

// Body Parser Middleware
// Parse incoming JSON request bodies
app.use(express.json());

// Rate Limiting Middleware
// Apply to all routes to prevent abuse
app.use(rateLimiter);

/**
 * API Routes
 * Authentication routes are public
 * Notes routes require authentication middleware
 */
app.use("/api/auth", authRoutes);
app.use("/api/notes", authMiddleware, notesRoutes);

/**
 * Production Static File Serving
 * Serve React frontend build files
 */
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

/**
 * Catch-all Route Handler
 * Send the React app for any unknown routes (SPA support)
 * This must be the last route
 */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

/**
 * Database Connection and Server Startup
 * Connect to MongoDB before starting the Express server
 */
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server started on PORT: ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});