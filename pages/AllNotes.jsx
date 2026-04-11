import React, { useState, useEffect } from "react";
import ModernSidebar from "../components/ModernSidebar";
import ModernNoteCard from "../components/ModernNoteCard";
import NoteModal from "../components/NoteModal";
import DeleteModal from "./DeleteModal";
import { FaTrash, FaPlus, FaStar, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

export default function AllNotes() {
  const { getAuthHeaders } = useAuth();
  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [deleteNote, setDeleteNote] = useState(null);
  const [isPermanent, setIsPermanent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  // 1. Always fetch ALL non-trash notes for Sidebar Counts
  useEffect(() => {
    fetch("http://localhost:5000/api/notes", {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllNotes(data);
      })
      .catch(err => console.error("Error fetching all notes:", err));
  }, [getAuthHeaders]);

  // 2. Fetch specific filter for Display Grid
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get("filter");
    const tag = params.get("tag");

    // Handle Tag filtering (Local filter for performance)
    if (tag) {
      if (allNotes.length > 0) {
        setNotes(allNotes.filter(n => n.tags && n.tags.includes(tag)));
      }
      return; 
    }

    // Handle Route Filters (API based)
    let url = "http://localhost:5000/api/notes";
    if (filter === "favorites") {
      url = "http://localhost:5000/api/notes/favourites/all";
    } else if (filter === "archived") {
      url = "http://localhost:5000/api/notes/archived/all";
    } else if (filter === "trash") {
      url = "http://localhost:5000/api/notes/trash/all";
    } else if (filter === "recent") {
      if (allNotes.length > 0) {
        setNotes(allNotes.filter(n => new Date(n.createdAt).toDateString() === new Date().toDateString()));
      } else {
        // Fallback or wait for allNotes
        fetch("http://localhost:5000/api/notes", { headers: getAuthHeaders() })
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setNotes(data.filter(n => new Date(n.createdAt).toDateString() === new Date().toDateString()));
            }
          });
      }
      return;
    }

    fetch(url, {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNotes(data);
      })
      .catch(err => console.error("Error fetching filtered notes:", err));
  }, [location.search, getAuthHeaders, allNotes]);

  const handleNewNote = () => {
    const newNote = {
      date: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    setActiveNote(newNote); 
  };

  const handleSave = async (updatedNote) => {
    let res;
    if (updatedNote._id) {
      res = await fetch(`http://localhost:5000/api/notes/${updatedNote._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedNote)
      });
      const data = await res.json();
      setNotes(prev => prev.map(note => note._id === data._id ? data : note));
    } else {
      res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedNote)
      });
      const savedNote = await res.json();
      setNotes(prev => [savedNote, ...prev]);
    }
  };

  const handleDelete = async (noteToDelete) => {
    if (isPermanent) {
      await fetch(`http://localhost:5000/api/notes/${noteToDelete._id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      toast.error("Note permanently deleted 🗑️");
    } else {
      await fetch(`http://localhost:5000/api/notes/trash/${noteToDelete._id}`, {
        method: "PUT",
        headers: getAuthHeaders()
      });
      toast.error("Note moved to Trash 🗑");
    }
    setNotes(prev => prev.filter(note => note._id !== noteToDelete._id));
    setDeleteNote(null);
    setIsPermanent(false);
  };

  const handlePermanentDeleteClick = (note) => {
    setIsPermanent(true);
    setDeleteNote(note);
  };

  const handleDeleteClick = (note) => {
    setIsPermanent(false);
    setDeleteNote(note);
  };

  const handleFavourite = async (id) => {
    setNotes(prev =>
      prev.map(note =>
        note._id === id ? { ...note, favourite: !note.favourite } : note
      )
    );
    await fetch(`http://localhost:5000/api/notes/favourite/${id}`, {
      method: "PUT",
      headers: getAuthHeaders()
    });
  };

  const handleRestore = async (note) => {
    await fetch(`http://localhost:5000/api/notes/${note._id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ trash: false })
    });
    setNotes(prev => prev.filter(n => n._id !== note._id));
    fetch("http://localhost:5000/api/notes", { headers: getAuthHeaders() })
    .then(res => res.json())
    .then(data => setAllNotes(data));
    toast.success("Note Restored ♻️");
  };

  const handleArchive = async (id) => {
    await fetch(`http://localhost:5000/api/notes/archive/${id}`, {
      method: "PUT",
      headers: getAuthHeaders()
    });
    const res = await fetch("http://localhost:5000/api/notes", { headers: getAuthHeaders() });
    const data = await res.json();
    setNotes(data);
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
    note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const params = new URLSearchParams(location.search);
  const filter = params.get("filter");

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors">
      <ModernSidebar notes={allNotes} />

      <main className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 shrink-0">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
              {filter === "recent" ? 'Recent' : (filter ? filter.replace('-', ' ') : 'All My Notes')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} {searchQuery ? 'matching' : 'found'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 justify-end">
            <div className="relative w-full max-w-xs">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>
            
            <button
              onClick={handleNewNote}
              className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center justify-center transition shadow-md shadow-blue-200 dark:shadow-none"
            >
              <FaPlus className="mr-2" /> New Note
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <ModernNoteCard
                  key={note._id}
                  note={note}
                  onClick={() => setActiveNote(note)}
                  onEdit={() => setActiveNote(note)}
                  onDelete={handleDeleteClick}
                  onPermanentDelete={handlePermanentDeleteClick}
                  onRestore={handleRestore}
                  onShare={handleShare}
                  onFavourite={() => handleFavourite(note._id)}
                  onArchive={() => handleArchive(note._id)}
                />
              ))
            ) : (
              <div className="xl:col-span-4 text-center py-20 px-10 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm transition-colors">
                <div className="text-4xl mb-4">{searchQuery ? '🔍' : 'Empty 💨'}</div>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? `No notes found for "${searchQuery}"` : "No notes found in this section."}
                </p>
                {searchQuery && (
                   <button 
                    onClick={() => setSearchQuery("")}
                    className="mt-4 text-blue-600 text-sm font-medium hover:underline"
                   >
                     Clear search
                   </button>
                )}
              </div>
            )}
          </div>

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
      </main>
    </div>
  );
}