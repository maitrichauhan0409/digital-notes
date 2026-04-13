import React, { useState, useEffect, useMemo } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaLock, FaLockOpen, FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminUsersList() {
  const { getAuthHeaders, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, blocked
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, name-asc, name-desc

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.username.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query) ||
        (u.contact && u.contact.toLowerCase().includes(query))
      );
    }

    // 2. Status Filter
    if (statusFilter !== "all") {
      const isBlocked = statusFilter === "blocked";
      result = result.filter(u => u.isBlocked === isBlocked);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "name-asc") return a.username.localeCompare(b.username);
      if (sortBy === "name-desc") return b.username.localeCompare(a.username);
      return 0;
    });

    return result;
  }, [users, searchQuery, statusFilter, sortBy]);

  const handleDeleteUser = async (id, username) => {
    const isConfirmed = window.confirm(`Are you absolutely sure you want to permanently delete the user '${username}' and all of their personal notes? This action is irreversible.`);
    if (!isConfirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/delete/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(`User ${username} securely deleted`);
        setUsers(prev => prev.filter(u => u._id !== id));
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to server");
    }
  };

  const handleToggleBlock = async (id, currentStatus, username) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/block/${id}`, {
        method: "PUT",
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Block API error status:", response.status, "body:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`User ${username} ${data.isBlocked ? 'blocked' : 'unblocked'} successfully`);
        setUsers(prev => prev.map(u => u._id === id ? { ...u, isBlocked: data.isBlocked } : u));
      } else {
        toast.error(data.message || "Failed to update block status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to server");
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 flex flex-col">
        <header className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-white">
          <div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <span>Admin</span>
              <span className="mx-2">/</span>
              <span className="text-gray-700 font-medium">User Management</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Registered Users</h1>
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
          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-6xl">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaSearch size={14} />
              </span>
              <input 
                type="text" 
                placeholder="Search by username, email or contact..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                <FaFilter size={12} className="text-gray-400" />
                <select 
                  className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 focus:ring-0"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="blocked">Blocked Only</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                <FaSortAmountDown size={12} className="text-gray-400" />
                <select 
                  className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 focus:ring-0"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
              </div>

              {/* Counter Badge */}
              <div className="ml-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-blue-100 flex items-center gap-2">
                <span>{filteredUsers.length}</span>
                <span className="opacity-60 uppercase tracking-tighter">Results</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-6xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Context
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined Platform
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                        Retrieving user database...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                        {searchQuery ? "No users matching your search criteria." : "No standard users are currently registered."}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${u.isBlocked ? 'bg-red-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-white font-bold text-sm uppercase">
                                {u.username.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {u.username}
                                {u.isBlocked && <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full uppercase">Blocked</span>}
                              </div>
                              <div className="text-sm text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{u.contact}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleToggleBlock(u._id, u.isBlocked, u.username)}
                            className={`border p-2 rounded-lg transition-all shadow-sm ${u.isBlocked ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200'}`}
                            title={u.isBlocked ? "Unblock User" : "Block User"}
                          >
                            {u.isBlocked ? <FaLockOpen size={14} /> : <FaLock size={14} />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u._id, u.username)}
                            className="bg-white border border-gray-200 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
                            title="Delete User & Private Notes"
                          >
                            <FaTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
