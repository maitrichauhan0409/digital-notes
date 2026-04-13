import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { FaSave, FaPlus, FaTrash, FaShieldAlt, FaTags, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { getAuthHeaders, logout } = useAuth();
  const [settings, setSettings] = useState({
    availableTags: [],
    minPasswordLength: 6
  });
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/settings", {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("http://localhost:5000/api/admin/settings", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to server");
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    if (settings.availableTags.includes(newTag.trim().toLowerCase())) {
        toast.error("Tag already exists");
        return;
    }
    setSettings({
      ...settings,
      availableTags: [...settings.availableTags, newTag.trim().toLowerCase()]
    });
    setNewTag("");
  };

  const removeTag = (tagToRemove) => {
    setSettings({
      ...settings,
      availableTags: settings.availableTags.filter(t => t !== tagToRemove)
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    
    if (passwords.newPassword.length < settings.minPasswordLength) {
        return toast.error(`Password must be at least ${settings.minPasswordLength} characters`);
    }

    setChangingPassword(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Password changed successfully!");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error connecting to server");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 flex flex-col">
        <header className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-white">
          <div>
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <span>Admin</span>
              <span className="mx-2">/</span>
              <span className="text-gray-700 font-medium">System Settings</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Global Configuration</h1>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
          >
            <FaSave />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </header>

        <div className="flex-1 p-6 overflow-auto bg-gray-50 space-y-6">
          {/* Tag Management Section */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-hidden max-w-4xl">
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                 <FaTags size={18} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-gray-800">Global Note Policy</h2>
                  <p className="text-xs text-gray-500">Manage the hash-tags available for all users in their note creation modal.</p>
               </div>
            </div>

            <div className="space-y-4">
               <label className="block text-sm font-semibold text-gray-700">Available Tags</label>
               <div className="flex space-x-2">
                 <input 
                   type="text" 
                   value={newTag}
                   onChange={(e) => setNewTag(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && addTag()}
                   placeholder="Enter new tag name (e.g. Work)"
                   className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                 />
                 <button 
                   onClick={addTag}
                   className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium text-sm flex items-center space-x-2"
                 >
                   <FaPlus /> <span>Add</span>
                 </button>
               </div>

               <div className="flex flex-wrap gap-2 mt-4">
                 {settings.availableTags.map(tag => (
                   <div key={tag} className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-100">
                     <span>#{tag}</span>
                     <button onClick={() => removeTag(tag)} className="text-blue-400 hover:text-red-500 transition-colors">
                       <FaTrash size={10} />
                     </button>
                   </div>
                 ))}
               </div>
            </div>
          </section>

          {/* Security Controls Section */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-hidden max-w-4xl">
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
               <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                 <FaShieldAlt size={18} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-gray-800">Security Controls</h2>
                  <p className="text-xs text-gray-500">Define global security constraints and password policies.</p>
               </div>
            </div>

            <div className="space-y-4 max-w-md">
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Password Length</label>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="range" 
                      min="4" 
                      max="20" 
                      value={settings.minPasswordLength}
                      onChange={(e) => setSettings({...settings, minPasswordLength: parseInt(e.target.value)})}
                      className="flex-1 accent-purple-600"
                    />
                    <span className="w-12 text-center bg-gray-100 px-2 py-1 rounded border border-gray-200 font-bold text-purple-700">
                      {settings.minPasswordLength}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 italic">Standard users will be forced to use at least this many characters during registration.</p>
               </div>
            </div>
          </section>

          {/* Admin Password Change Section */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-hidden max-w-4xl">
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
               <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                 <FaLock size={18} />
               </div>
               <div>
                  <h2 className="text-lg font-bold text-gray-800">Account Security</h2>
                  <p className="text-xs text-gray-500">Update your administrator password regularly to keep the system secure.</p>
               </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    required
                  />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                    <input 
                      type="password" 
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      required
                    />
                  </div>
               </div>
               <div className="pt-2">
                 <button 
                   type="submit"
                   disabled={changingPassword}
                   className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition font-medium text-sm disabled:opacity-50"
                 >
                   {changingPassword ? "Updating..." : "Update Password"}
                 </button>
               </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
