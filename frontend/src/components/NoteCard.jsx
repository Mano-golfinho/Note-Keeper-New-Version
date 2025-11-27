/**
 * @fileoverview Note Card Component - Displays a single note in card format
 * @module components/NoteCard
 */

import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import { formatDate } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { memo, useCallback } from "react";

/**
 * Note Card Component
 * Displays a note with title, content preview, timestamp, and action buttons
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.note - Note data object
 * @param {string} props.note._id - Unique note identifier
 * @param {string} props.note.title - Note title
 * @param {string} props.note.content - Note content
 * @param {string} props.note.createdAt - Note creation timestamp
 * @param {Function} props.setNotes - State setter function to update notes list
 * @returns {JSX.Element} Rendered note card
 * 
 * @example
 * <NoteCard 
 *   note={{ _id: '123', title: 'My Note', content: 'Content...' }} 
 *   setNotes={setNotes} 
 * />
 */
const NoteCard = memo(({ note, setNotes }) => {
  /**
   * Handle note deletion
   * Prompts user for confirmation, then deletes note from backend and updates local state
   * 
   * @param {Event} e - Click event
   * @param {string} id - Note ID to delete
   */
  const handleDelete = useCallback(async (e, id) => {
    // Prevent navigation when clicking delete button
    e.preventDefault();

    // Confirm deletion with user
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      // Delete from backend
      await api.delete(`/notes/${id}`);

      // Update local state by filtering out deleted note
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));

      // Show success notification
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  }, [setNotes]);

  return (
    <Link
      to={`/note/${note._id}`}
      className="card bg-base-100 hover:shadow-lg transition-all duration-200 
      border-t-4 border-solid border-[#00FF9D]"
    >
      <div className="card-body">
        {/* Note Title */}
        <h3 className="card-title text-base-content">{note.title}</h3>

        {/* Note Content Preview - Limited to 3 lines */}
        <p className="text-base-content/70 line-clamp-3">{note.content}</p>

        {/* Card Footer - Date and Actions */}
        <div className="card-actions justify-between items-center mt-4">
          {/* Creation Date */}
          <span className="text-sm text-base-content/60">
            {formatDate(new Date(note.createdAt))}
          </span>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Edit Icon (visual only, navigation handled by Link) */}
            <PenSquareIcon className="size-4" />

            {/* Delete Button */}
            <button
              className="btn btn-ghost btn-xs text-error"
              onClick={(e) => handleDelete(e, note._id)}
              aria-label="Delete note"
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
});

// Set display name for debugging
NoteCard.displayName = 'NoteCard';

export default NoteCard;