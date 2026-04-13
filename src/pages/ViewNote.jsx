import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/ModernSidebar";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";

export default function ViewNote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const notes = [
    { id: 1, title: "hello", content: "wssup...", date: "29 Aug 2025" },
    { id: 2, title: "Shopping list", content: "potato onion garlic ...", date: "28 Aug 2025" },
    { id: 3, title: "whatever", content: "now goo ...", date: "28 Aug 2025" },
  ];

  const note = notes.find((n) => n.id === Number(id));

  if (!note) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center text-xl text-gray-500">
          Note not found
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <header className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center text-xs text-gray-500 mb-4">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-gray-700">View Note</span>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/all-notes")}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-xl shadow p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{note.title}</h1>
            <p className="text-sm text-gray-400 mb-6">{note.date}</p>
            <p className="text-lg text-gray-700 leading-relaxed">{note.content}</p>
            <div className="flex space-x-4 mt-8">
              <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm shadow-sm">
                <FaEdit className="mr-2" /> Edit
              </button>
              <button className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm shadow-sm">
                <FaTrash className="mr-2" /> Delete
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
