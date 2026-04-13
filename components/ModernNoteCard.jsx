import React from 'react';
import { FaPlus, FaStar, FaRegStar, FaEdit, FaTrash, FaUndo, FaShareAlt } from 'react-icons/fa';

export default function ModernNoteCard({ note, isNew = false, onClick, onMenuClick, onFavourite, onEdit, onDelete, onRestore, onPermanentDelete, onShare }) {
  const cardColors = [
    { bg: 'bg-blue-50 dark:bg-blue-900/20', header: 'bg-blue-100 dark:bg-blue-800/40' },
    { bg: 'bg-green-50 dark:bg-green-900/20', header: 'bg-green-100 dark:bg-green-800/40' },
    { bg: 'bg-yellow-50 dark:bg-yellow-900/20', header: 'bg-yellow-100 dark:bg-yellow-800/40' },
    { bg: 'bg-purple-50 dark:bg-purple-900/20', header: 'bg-purple-100 dark:bg-purple-800/40' },
    { bg: 'bg-pink-50 dark:bg-pink-900/20', header: 'bg-pink-100 dark:bg-pink-800/40' },
  ];

  if (isNew) {
    return (
      <div 
        onClick={onClick}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all min-h-[180px] flex flex-col items-center justify-center"
      >
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
          <FaPlus className="text-gray-500 dark:text-gray-400 text-sm" />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">Add note</span>
      </div>
    );
  }

  const colorScheme = cardColors[Math.abs(note.title?.length || 0) % cardColors.length] || cardColors[0];
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`${colorScheme.bg} rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow min-h-[180px] flex flex-col`}>
      {/* Header */}
      <div className={`${colorScheme.header} px-3 py-2 flex items-center justify-between`}>
        <span className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate pr-2">
          {note.category || 'General'}
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onFavourite) {
              onFavourite(note);
            } else if (onMenuClick) {
              onMenuClick(note);
            }
          }}
          className={`p-1 transition-colors ${note.favourite ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-yellow-400'}`}
        >
          {note.favourite ? <FaStar className="text-sm" /> : <FaRegStar className="text-sm" />}
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-3" onClick={onClick}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {note.title || 'Untitled Note'}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
          {note.content || 'No content'}
        </p>
        
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-blue-100/50 text-blue-700 rounded-md text-[10px] font-semibold border border-blue-200/50 transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(note.date || note.createdAt)}
        </span>
        <div className="flex space-x-2">
          {note.trash ? (
            <div className="flex space-x-2">
              {onRestore && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onRestore(note); }} 
                  className="text-gray-400 hover:text-green-500 transition-colors p-1"
                  title="Restore Note"
                >
                  <FaUndo className="text-xs" />
                </button>
              )}
              {onPermanentDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onPermanentDelete(note); }} 
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Delete Permanently"
                >
                  <FaTrash className="text-xs" />
                </button>
              )}
            </div>
          ) : (
            <>
              {onEdit && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(note); }} 
                  className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                  title="Edit Note"
                >
                  <FaEdit className="text-xs" />
                </button>
              )}
              {onShare && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onShare(note); }} 
                  className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                  title="Share to WhatsApp"
                >
                  <FaShareAlt className="text-xs" />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(note); }} 
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  title="Move to Trash"
                >
                  <FaTrash className="text-xs" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
