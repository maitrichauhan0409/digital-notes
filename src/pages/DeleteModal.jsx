import React from "react";
import { FaTimes } from "react-icons/fa";

const DeleteModal = ({ note, onClose, onDelete, isPermanent = false }) => {
  
  const handleConfirmDelete = () => {
    onDelete(note); 
    onClose(); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-white/20 dark:border-gray-700 transition-colors">
        <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {isPermanent ? "Delete Permanently?" : "Move to Trash?"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <FaTimes size={18} />
          </button>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-8 text-sm leading-relaxed">
          {isPermanent ? (
            <>
              Are you sure you want to <span className="font-bold text-red-600">permanently delete</span> the note <span className="font-bold italic text-blue-600 dark:text-blue-400">"{note.title}"</span>?
              <br /><span className="text-xs text-red-500 font-semibold mt-2 block">⚠️ This action cannot be undone.</span>
            </>
          ) : (
            <>
              Are you sure you want to move the note <span className="font-bold italic text-blue-600 dark:text-blue-400">"{note.title}"</span> to Trash? 
              <br /><span className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">You can restore it later from the Trash folder.</span>
            </>
          )}
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm"
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirmDelete}
            className={`px-5 py-2.5 ${isPermanent ? 'bg-red-700' : 'bg-red-600'} text-white rounded-xl font-semibold shadow-lg shadow-red-200 dark:shadow-none hover:opacity-90 transition text-sm`}
          >
            {isPermanent ? "Delete Permanently" : "Yes, Move to Trash"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;