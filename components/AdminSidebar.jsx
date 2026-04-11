import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaChartLine, FaUsers, FaUserShield, FaSignOutAlt, FaCog } from 'react-icons/fa';

export default function AdminSidebar() {
  const location = useLocation();
  const { user, authLoading, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-200 h-screen flex flex-col">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
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
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-sm text-white font-bold text-sm">
              {user?.username?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.username || "Admin"}
              </p>
              <p className="text-[10px] text-rose-600 font-bold truncate uppercase tracking-wider">
                Administrator
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="space-y-1">
          <Link
            to="/admin/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/dashboard') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
          >
            <FaChartLine size={16} />
            <span className="font-medium text-sm">Overview</span>
          </Link>

          <Link
            to="/admin/users"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/users') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
          >
            <FaUsers size={16} />
            <span className="font-medium text-sm">Manage Users</span>
          </Link>

          <Link
            to="/admin/settings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive('/admin/settings') ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}
          >
            <FaCog size={16} />
            <span className="font-medium text-sm">System Settings</span>
          </Link>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200 space-y-1">
         <button 
           onClick={logout}
           className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-50 w-full transition-colors font-medium"
         >
           <FaSignOutAlt className="text-xs" />
           <span>Sign Out</span>
         </button>
      </div>
    </aside>
  );
}
