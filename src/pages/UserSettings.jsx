import React, { useState, useEffect } from "react";
import ModernSidebar from "../components/ModernSidebar";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaPalette, FaLock, FaDownload, FaSave, FaTrash, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function UserSettings() {
  const navigate = useNavigate();
  const { user, getAuthHeaders, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    contact: ""
  });

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Sync profile data when user is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        contact: user.contact || ""
      });
    }
  }, [user]);

  // App Preferences
  const [preferences, setPreferences] = useState({
    theme: localStorage.getItem("theme") || "light",
    viewMode: localStorage.getItem("viewMode") || "grid"
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/update-profile", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (data.success) {
        // Update user context with new data
        updateUser(data.user);
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update frontend error:", error);
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const savePreference = (key, value) => {
    setPreferences({ ...preferences, [key]: value });
    localStorage.setItem(key, value);

    // Apply theme immediately if it's the theme key
    if (key === "theme") {
      if (value === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} preference saved!`);
  };

  const exportNotes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/notes", {
        headers: getAuthHeaders()
      });
      const notes = await response.json();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "my_notes_backup.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success("Notes exported successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export notes");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PUT",
        headers: getAuthHeaders(),
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
      toast.error("Error changing password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors">
      <ModernSidebar />

      <main className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
        <header className="border-b border-gray-200 dark:border-gray-800 px-8 py-6 bg-white dark:bg-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-400"
              title="Go Back"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Settings</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and app preferences</p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Settings Tabs */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-2">
            {[
              { id: "profile", label: "Profile", icon: <FaUser /> },
              { id: "appearance", label: "Appearance", icon: <FaPalette /> },
              { id: "security", label: "Security", icon: <FaLock /> },
              { id: "data", label: "Data & Backup", icon: <FaDownload /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-auto">
            <div className="max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-8 transition-colors">
              {activeTab === "profile" && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl font-bold">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800 dark:text-white">Personal Information</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Update your account details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={profileData.username}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contact Number</label>
                      <input
                        type="text"
                        name="contact"
                        value={profileData.contact}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition font-medium text-sm flex items-center space-x-2 disabled:opacity-50"
                    >
                      <FaSave />
                      <span>{loading ? "Updating..." : "Update Profile"}</span>
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Visual Preferences</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {["light", "dark"].map((t) => (
                        <button
                          key={t}
                          onClick={() => savePreference("theme", t)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${preferences.theme === t ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-500"
                            }`}
                        >
                          <div className={`w-full h-20 rounded-lg mb-3 ${t === "dark" ? "bg-gray-800 border dark:border-gray-600" : "bg-gray-100 shadow-inner"}`}></div>
                          <p className="text-sm font-bold capitalize text-gray-700 dark:text-gray-300">{t} Mode</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-700">


                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Security Settings</h2>
                  
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Current Password</label>
                      <input
                        type="password"
                        value={passwords.currentPassword}
                        onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Password</label>
                      <input
                        type="password"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white"
                        required
                      />
                    </div>
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50"
                      >
                        {loading ? "Changing..." : "Change Password"}
                      </button>
                    </div>
                  </form>

                  <div className="pt-10 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Permanently delete your account and all your notes</p>
                    <button className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-6 py-2 rounded-xl hover:bg-red-600 hover:text-white transition font-bold text-xs flex items-center space-x-2">
                      <FaTrash />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-6 text-center py-10">
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaDownload size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Backup your data</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    Download a copy of all your notes in a JSON format. You can use this to restore your notes at any time.
                  </p>
                  <div className="pt-6">
                    <button
                      onClick={exportNotes}
                      className="bg-gray-800 text-white px-8 py-3 rounded-xl hover:bg-gray-900 transition shadow-lg font-bold text-sm"
                    >
                      Export Notes (.json)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
