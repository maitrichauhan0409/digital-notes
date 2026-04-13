import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaStickyNote } from 'react-icons/fa';

export default function AdminDashboard() {
  const { getAuthHeaders, logout } = useAuth();
  const [stats, setStats] = useState({ usersCount: 0, notesCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/stats", {
      headers: getAuthHeaders()
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats({ usersCount: data.usersCount, notesCount: data.notesCount });
        }
        setLoading(false);
      })
      .catch(console.error);
  }, [getAuthHeaders]);

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 flex flex-col">
        <header className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-white">
          <div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <span>Admin</span>
              <span className="mx-2">/</span>
              <span className="text-gray-700 font-medium">Dashboard Overview</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">System Statistics</h1>
          </div>
          <div>
            <button 
              onClick={logout}
              className="text-sm font-medium text-gray-600 bg-gray-50 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* Stat Card 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-6 hover:shadow-md transition-shadow">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                <FaUsers className="text-3xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1 tracking-wide uppercase">Total Registered Users</p>
                <div className="flex items-baseline space-x-2">
                  <h2 className="text-4xl font-extrabold text-gray-900">
                    {loading ? "..." : stats.usersCount}
                  </h2>
                  <span className="text-sm text-green-500 font-medium">+ accounts</span>
                </div>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center space-x-6 hover:shadow-md transition-shadow">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                <FaStickyNote className="text-3xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1 tracking-wide uppercase">Total Network Notes</p>
                <div className="flex items-baseline space-x-2">
                  <h2 className="text-4xl font-extrabold text-gray-900">
                    {loading ? "..." : stats.notesCount}
                  </h2>
                  <span className="text-sm text-blue-500 font-medium">secured notes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
