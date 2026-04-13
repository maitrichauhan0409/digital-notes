import React from "react";
import { Feather, Edit, Tag, Cloud } from "lucide-react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-full bg-blue-500">
            <Feather className="text-white w-5 h-5" />
          </div>
          <span className="font-semibold text-lg">Digital Notes</span>
        </div>

        <div className="flex space-x-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Sign Up
          </Link>
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-snug">
          Your Ideas, Perfectly <br /> Organized.
        </h1>
        <p className="text-gray-600 max-w-2xl text-lg">
          A streamlined, cross-platform digital note-taking system designed to help you
          efficiently capture, organize, and retrieve information. Transform the way you
          manage your thoughts, projects, and daily tasks with powerful features and a
          clean, intuitive interface.
        </p>
      </section>
      <section className="py-16 bg-gray-50 px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
              <Edit className="text-blue-600 w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Organization</h3>
            <p className="text-gray-600">Intelligent categorization and tagging system</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
              <Tag className="text-blue-600 w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Optimized performance and instant sync</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
              <Cloud className="text-blue-600 w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Secure & Private</h3>
            <p className="text-gray-600">End-to-end encryption and privacy controls</p>
          </div>
        </div>
      </section>
    </div>
  );
};
