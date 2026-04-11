import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaStickyNote,
  FaStar,
  FaClock,
  FaTags,
  FaBook,
  FaProjectDiagram,
  FaShareAlt,
  FaCog,
  FaSync,
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt
} from 'react-icons/fa';

export default function ModernSidebar({ notes = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, authLoading, getAuthHeaders, logout } = useAuth();
  const [allTags, setAllTags] = useState([]);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [trashCount, setTrashCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!user) return;

    // Fetch Trash Count
    fetch("http://localhost:5000/api/notes/trash/all", {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTrashCount(data.length);
        }
      })
      .catch(console.error);

    // Fetch Global Tags
    fetch("http://localhost:5000/api/admin/public-settings", {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings?.availableTags) {
          setAllTags(data.settings.availableTags);
        }
      })
      .catch(console.error);
  }, [user, getAuthHeaders, notes]);

  const navItems = [
    {
      icon: <FaStickyNote className="text-xs" />,
      label: "All notes",
      to: "/all-notes",
      count: notes?.length || 0
    },
    {
      icon: <FaStar className="text-xs" />,
      label: "Favorites",
      to: "/all-notes?filter=favorites",
      count: (notes || []).filter(n => n.favourite).length
    },
    {
      icon: <FaClock className="text-xs" />,
      label: "Recent notes",
      to: "/all-notes?filter=recent",
      count: (notes || []).filter(n => new Date(n.createdAt).toDateString() === new Date().toDateString()).length
    },
    {
      icon: <FaTags className="text-xs" />,
      label: "Tags",
      to: "/tags", // We handle the onClick manually instead of navigating if it's acting as a dropdown
      count: allTags.length
    },
    {
      icon: <FaTrash className="text-xs" />,
      label: "Trash",
      to: "/all-notes?filter=trash",
      count: trashCount
    }
  ];

  const isActive = (path) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path && !location.search;
  };

  return (
    <aside className="w-56 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col transition-colors">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        {authLoading ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.username || user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          {navItems.map((item, index) => {
            if (item.label === "Tags") {
              return (
                <div key={index} className="flex flex-col">
                  <button
                    onClick={() => setIsTagsOpen(!isTagsOpen)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${location.search.includes('tag=')
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.count > 0 && <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{item.count}</span>}
                      {isTagsOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                    </div>
                  </button>
                  {isTagsOpen && allTags.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1 overflow-y-auto max-h-40 scrollbar-thin scrollbar-thumb-gray-300">
                      {allTags.map(tag => (
                        <Link
                          key={tag}
                          to={`/all-notes?tag=${tag}`}
                          className={`flex items-center px-3 py-2 rounded-lg text-xs transition-colors ${isActive(`/all-notes?tag=${tag}`)
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                          <span className="truncate">#{tag}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={index}
                to={item.to}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${isActive(item.to)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{item.count}</span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200">
        <Link
          to="/settings"
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs transition-colors ${location.pathname === '/settings' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            } w-full mb-1`}
        >
          <FaCog className="text-xs" />
          <span>Settings</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full mb-1 transition-colors"
        >
          <FaSignOutAlt className="text-xs" />
          <span>Logout</span>
        </button>

      </div>
    </aside>
  );
}
