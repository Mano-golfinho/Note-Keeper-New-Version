/**
 * @fileoverview Home Page - Main dashboard displaying all user notes
 * @module pages/HomePage
 */

import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import RateLimitedUI from "../components/RateLimitedUI";
import api from "../lib/axios";
import toast from "react-hot-toast";
import NoteCard from "../components/NoteCard";
import NotesNotFound from "../components/NotesNotFound";

/**
 * Home Page Component
 * Displays a grid of user's notes with create/edit/delete functionality
 * Handles loading states, empty states, and rate limiting
 * 
 * @component
 * @returns {JSX.Element} Home page with notes grid
 */
const HomePage = () => {
  // State management
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch all notes for the authenticated user
   * Memoized to prevent unnecessary re-renders
   */
  const fetchNotes = useCallback(async () => {
    try {
      const res = await api.get("/notes");
      console.log(res.data);
      setNotes(res.data);
      setIsRateLimited(false);
    } catch (error) {
      console.log("Error fetching notes");
      console.log(error.response);

      // Check if error is due to rate limiting
      if (error.response?.status === 429) {
        setIsRateLimited(true);
      } else {
        toast.error("Failed to load notes");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <Navbar />

      {/* Rate Limit Warning */}
      {isRateLimited && <RateLimitedUI />}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-4 mt-6">
        {/* Loading State */}
        {loading && (
          <div className="text-center text-primary py-10">
            Loading notes...
          </div>
        )}

        {/* Empty State - No notes found */}
        {notes.length === 0 && !isRateLimited && <NotesNotFound />}

        {/* Notes Grid - Display all notes */}
        {notes.length > 0 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} setNotes={setNotes} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;