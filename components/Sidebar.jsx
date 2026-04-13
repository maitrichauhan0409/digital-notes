import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Feather } from "lucide-react";

import {
  FaStickyNote,
  FaStar,
  FaClock,
  FaFolderOpen,
  FaTrash,
  FaTags,
  FaPlus,
  FaBars,
  FaSignOutAlt,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

export default function Sidebar({ handleNewNote, notes = [] }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const favouriteNotes = notes.filter(note => note.favourite);
  const archivedNotes = notes?.filter(note => note.archived);
  const trashNotes = notes?.filter(note => note.trash);

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-64"
        } bg-white shadow-md flex flex-col p-4 transition-all duration-300`}
    >

      <div className="flex items-center justify-between mb-6">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500">
              <Feather className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-lg">Digital Notes</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-gray-100"
        >
          <FaBars />
        </button>
      </div>

      <button
        onClick={handleNewNote}
        className={`bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-4 rounded-lg flex items-center justify-center mb-6 ${collapsed ? "justify-center px-0" : ""
          }`}
      >
        <FaPlus className="mr-2" /> New Note      </button>


      <nav className="flex flex-col space-y-2 mb-6">
        <NavItem
          icon={<FaStickyNote />}
          label="All Notes"
          count={notes?.length}
          to="/all-notes"
          collapsed={collapsed}
          active={location.pathname === "/all-notes" && !location.search} />

        <NavItem
          icon={<FaStar />}
          label="Favorites"
          count={notes.filter(n => n.favourite).length}
          to="/all-notes?filter=favorites"
          collapsed={collapsed}
          active={location.search === "?filter=favorites"}
        />

        <NavItem
          icon={<FaClock />}
          label="Recent"
          count={notes?.length}
          to="/all-notes?filter=recent"
          collapsed={collapsed}
        />



        <NavItem
          icon={<FaTrash />}
          label="Trash"
          count={notes.filter(n => n.trash).length}
          to="/all-notes?filter=trash"
          collapsed={collapsed}
        />
      </nav>

      {!collapsed && (
        <div className="mt-4">
          <h3 className="text-gray-500 text-sm mb-2">Tags</h3>
          <TagItem label="work" count={8} />
          <TagItem label="personal" count={5} />
          <TagItem label="ideas" count={12} />
          <TagItem label="projects" count={6} />
          <TagItem label="reading" count={4} />
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start space-x-2'} p-2 rounded-lg text-red-600 hover:bg-red-50 transition`}
        >
          <FaSignOutAlt className={`${!collapsed && 'mr-2'}`} />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

    </aside>
  );
}

const NavItem = ({ icon, label, count, to, collapsed, active }) => {
  const content = (
    <div
      className={`flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer ${active ? "bg-indigo-100 text-indigo-600" : "text-gray-700 hover:bg-gray-100"
        }`}
    >
      <div className="flex items-center space-x-2">
        {icon}
        {!collapsed && <span>{label}</span>}
      </div>
      {!collapsed && <span className="text-sm text-gray-500">{count}</span>}
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
};

const TagItem = ({ label, count }) => (
  <div className="flex justify-between text-gray-600 px-2 py-1 cursor-pointer hover:bg-gray-100 rounded-lg">
    <span>#{label}</span>
    <span className="text-sm">{count}</span>
  </div>
);