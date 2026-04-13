import React, { useState, useEffect } from "react";
import Sidebar from "../components/ModernSidebar";
import { useAuth } from "../context/AuthContext"; 

export default function Dashboard() {
  const { user, getAuthHeaders } = useAuth(); 
  const [notes, setNotes] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notes", {
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          const notesData = await response.json();
          setNotes(notesData);
        } else {
          console.error("Failed to fetch notes");
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotes();
    }
  }, [user, getAuthHeaders]);

  const totalNotes = notes.length; 

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center text-xs text-gray-500">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-gray-700">Dashboard</span>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Welcome, {user?.username || user?.email}!
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">Total Notes</h2>
            <p className="text-3xl mt-2 text-blue-500">
              {loading ? "..." : totalNotes}
            </p>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}