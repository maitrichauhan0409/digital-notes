import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStickyNote, FaCalendarAlt, FaTags } from 'react-icons/fa';

export default function PublicNoteView() {
  const { shareableId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicNote = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/public/notes/s/${shareableId}`);
        const data = await response.json();

        if (response.ok) {
          setNote(data);
        } else {
          setError(data.message || "Note not found");
        }
      } catch (err) {
        setError("Failed to load note. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicNote();
  }, [shareableId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="text-4xl mb-4 text-gray-400">📝</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Note Unavailable</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Go to Digital Notes
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors">
      <div className="max-w-3xl mx-auto">
        {/* Logo/Header */}
        <div className="flex items-center space-x-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                <FaStickyNote className="text-white text-sm" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Digital Notes
            </span>
        </div>

        {/* Note Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Header Metadata */}
          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
              <span className="flex items-center">
                <FaCalendarAlt className="mr-2 opacity-70" />
                {new Date(note.createdAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
              {note.category && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-medium">
                  {note.category}
                </span>
              )}
            </div>
            
            <div className="text-xs text-gray-400 dark:text-gray-500 italic">
              Shared via Public Link
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {note.title || "Untitled Note"}
            </h1>
            
            <div className="prose prose-blue dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-lg">
                {note.content}
              </p>
            </div>

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-50 dark:border-gray-700">
                <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mb-3">
                  <FaTags className="mr-2" />
                  TAGS
                </div>
                <div className="flex flex-wrap gap-2">
                  {note.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer Branding */}
          <div className="px-8 py-6 bg-blue-600 text-center">
            <p className="text-white/80 text-sm font-medium">
              Want to create your own notes? 
              <a href="/register" className="ml-2 text-white border-b border-white/40 hover:border-white transition-colors">
                Sign up for free
              </a>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-sm text-gray-400 dark:text-gray-500">
            Digital Notes &copy; {new Date().getFullYear()} &bull; Secure Cloud Storage
        </p>
      </div>
    </div>
  );
}
