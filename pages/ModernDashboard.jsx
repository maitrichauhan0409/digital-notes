import React, { useState, useEffect } from "react";
import ModernSidebar from "../components/ModernSidebar";
import ModernNoteCard from "../components/ModernNoteCard";
import { useAuth } from "../context/AuthContext";
import { FaSearch, FaTh, FaList, FaPlus } from 'react-icons/fa';
import NoteModal from "../components/NoteModal";
import DeleteModal from "./DeleteModal";
import toast from "react-hot-toast";

export default function ModernDashboard() {
  const { user, getAuthHeaders, authLoading, isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [activeNote, setActiveNote] = useState(null);
  const [deleteNote, setDeleteNote] = useState(null);
  const [isPermanent, setIsPermanent] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        console.log("Fetching notes with headers:", getAuthHeaders());
        const response = await fetch("http://localhost:5000/api/notes", {
          headers: getAuthHeaders() // Use Authorization header with JWT token
        });

        console.log("Notes API response status:", response.status);

        if (response.ok) {
          const notesData = await response.json();
          console.log("Notes data received:", notesData);
          setNotes(notesData);
        } else {
          console.error("Failed to fetch notes, status:", response.status);
          const errorText = await response.text();
          console.error("Error response:", errorText);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && isAuthenticated && !authLoading) {
      console.log("User authenticated, fetching notes...");
      fetchNotes();
    } else if (!authLoading && (!user || !isAuthenticated)) {
      console.log("User not authenticated, setting loading false");
      setLoading(false);
    }
  }, [user, getAuthHeaders, isAuthenticated, authLoading]);

  const handleNewNote = () => {
    const newNote = {
      // title: "Untitled Note",
      // content: "Start writing your note here...",
      date: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    setActiveNote(newNote);
  };

  const handleNoteClick = (note) => {
    setActiveNote(note);
  };

  const handleSave = async (updatedNote) => {
    try {
      let res;

      if (updatedNote._id) {
        // UPDATE
        res = await fetch(`http://localhost:5000/api/notes/${updatedNote._id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(updatedNote)
        });

        const data = await res.json();
        const updatedData = { ...data, tags: updatedNote.tags || data.tags };

        setNotes(prev =>
          prev.map(note =>
            note._id === updatedData._id ? updatedData : note
          )
        );
      } else {
        // CREATE
        res = await fetch("http://localhost:5000/api/notes", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(updatedNote)
        });

        const savedNote = await res.json();
        const finalNote = { ...savedNote, tags: updatedNote.tags || savedNote.tags };

        setNotes(prev => [finalNote, ...prev]);
      }

      setActiveNote(null);
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleMenuClick = (note) => {
    // Handle menu actions (edit, delete, favorite, etc.)
    console.log("Menu clicked for note:", note);
  };

  const handleDelete = async (noteToDelete) => {
    try {
      if (isPermanent) {
        // PERMANENT DELETE
        await fetch(`http://localhost:5000/api/notes/${noteToDelete._id}`, {
          method: "DELETE",
          headers: getAuthHeaders()
        });
        toast.error("Note permanently deleted 🗑️");
      } else {
        // MOVE TO TRASH
        await fetch(`http://localhost:5000/api/notes/trash/${noteToDelete._id}`, {
          method: "PUT",
          headers: getAuthHeaders()
        });
        toast.error("Note moved to Trash 🗑");
      }

      // remove from current list
      setNotes(prev =>
        prev.filter(note => note._id !== noteToDelete._id)
      );

      setDeleteNote(null);
      setIsPermanent(false);
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  const handlePermanentDeleteClick = (note) => {
    setIsPermanent(true);
    setDeleteNote(note);
  };

  const handleDeleteClick = (note) => {
    setIsPermanent(false);
    setDeleteNote(note);
  };

  const handleRestore = async (note) => {
    try {
      await fetch(`http://localhost:5000/api/notes/${note._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ trash: false })
      });

      // instantly remove from Trash display if we are in trash view
      // But Dashboard usually only shows non-trash notes.
      setNotes(prev => prev.filter(n => n._id !== note._id));
      toast.success("Note Restored ♻️");
    } catch (error) {
      console.error("Error restoring note:", error);
      toast.error("Failed to restore note");
    }
  };

  const handleShare = async (note) => {
    try {
      // Format tags for WhatsApp (adding # and joining with space)
      const tagsText = note.tags && note.tags.length > 0 
        ? `\n\n*Tags:* ${note.tags.map(tag => `#${tag}`).join(' ')}` 
        : '';

      // Construct Message
      const message = `📝 *Title:* ${note.title}\n\n*Content:* ${note.content}${tagsText}`;
      
      // Open WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error("WhatsApp share error:", error);
      toast.error("Failed to share to WhatsApp");
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex h-screen">
        <ModernSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent border-r-transparent animate-spin rounded-full mb-4"></div>
            <div className="text-gray-500 text-sm">Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!user || !isAuthenticated) {
    return (
      <div className="flex h-screen">
        <ModernSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-4">Please log in to access your dashboard</div>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
            >
              Go to Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors">
      <ModernSidebar notes={notes} />
      
      <main className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
            <span className="mx-2">/</span>
            <span className="text-gray-700 dark:text-gray-200">All notes</span>
          </div>

          {/* Search and Controls */}
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search a note"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-gray-200" : "hover:bg-gray-100"}`}
              >
                <FaTh className="text-xs text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-gray-200" : "hover:bg-gray-100"}`}
              >
                <FaList className="text-xs text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Notes Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNotes.map((note) => (
              <ModernNoteCard
                key={note._id}
                note={note}
                onClick={() => handleNoteClick(note)}
                onMenuClick={handleMenuClick}
                onDelete={handleDeleteClick}
                onPermanentDelete={handlePermanentDeleteClick}
                onRestore={handleRestore}
                onShare={handleShare}
              />
            ))}

            {/* Add New Note Card */}
            <ModernNoteCard isNew onClick={handleNewNote} />
          </div>

          {filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-2xl text-gray-400" />
              </div>
              <p className="text-sm">No notes found</p>
              <p className="text-xs mt-1">Try adjusting your search or create a new note</p>
            </div>
          )}
        </div>
      </main>

      {/* Note Modal */}
      {activeNote && (
        <NoteModal
          note={activeNote}
          onClose={() => setActiveNote(null)}
          onSave={handleSave}
        />
      )}

      {deleteNote && (
        <DeleteModal
          note={deleteNote}
          isPermanent={isPermanent}
          onClose={() => { setDeleteNote(null); setIsPermanent(false); }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
