import { useState, useEffect } from "react";
import { FaTimes, FaEdit, FaSave } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function NoteModal({ note, onClose, onSave }) {
  const { getAuthHeaders } = useAuth();
  const [isEditing, setIsEditing] = useState(!note._id);
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [selectedTags, setSelectedTags] = useState(note.tags || []);
  const [availableTags, setAvailableTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/admin/public-settings", {
          headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.success) {
          setAvailableTags(data.settings.availableTags);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        // Fallback tags in case of error
        setAvailableTags(["general", "personal", "work"]);
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, [getAuthHeaders]);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      toast.error("Please provide a title or content for your note.");
      return;
    }
    onSave({ ...note, title, content, tags: selectedTags });
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 transition-all p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg p-8 rounded-2xl shadow-2xl relative border border-white/20 dark:border-gray-700 transition-colors">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          <FaTimes size={18} />
        </button>



        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {!note._id ? "Create Note" : isEditing ? "Edit Note" : "View Note"}
        </h2>

        {isEditing ? (
          <div className="space-y-5">
            <div>
              <label className="block text-gray-600 dark:text-gray-400 font-medium mb-2 text-sm">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-2">
                Content
              </label>
              <textarea
                rows="5"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-400 font-medium mb-2 text-sm">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {loadingTags ? (
                  <span className="text-xs text-gray-400">Loading tags...</span>
                ) : availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedTags.includes(tag) ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none text-sm font-semibold"
              >
                <FaSave className="mr-2" /> Save Changes
              </button>
            </div>
          </div>
        ) : (

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{note.title || 'Untitled Note'}</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {note.date || 'Today'}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 min-h-[100px]">
               <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{note.content || 'Empty note content...'}</p>
            </div>

            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {note.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold border border-blue-100 dark:border-blue-800">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6 border-t border-gray-100 dark:border-gray-700 pt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition font-semibold text-sm"
              >
                <FaEdit className="mr-2" /> Edit Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
