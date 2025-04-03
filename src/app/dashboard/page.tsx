"use client";
import { useState } from "react";
import { FiHome, FiClipboard, FiAward, FiUser } from "react-icons/fi"; // Icons for Sidebar

export default function Dashboard() {
  const [karma, setKarma] = useState(100); // Example starting karma

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-center mb-8 tracking-wide">GoodDeeds</h2>
        <nav className="flex flex-col space-y-6">
          <a href="/dashboard" className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition">
            <FiHome className="text-xl" /> <span>Dashboard</span>
          </a>
          <a href="/tasks" className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition">
            <FiClipboard className="text-xl" /> <span>Tasks</span>
          </a>
          <a href="/leaderboard" className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition">
            <FiAward className="text-xl" /> <span>Leaderboard</span>
          </a>
          <a href="/profile" className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition">
            <FiUser className="text-xl" /> <span>Profile</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-blue-700 transition">
            + Post a Task
          </button>
        </div>

        {/* Karma Overview */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-300">Your Karma</h2>
          <p className="text-5xl font-bold text-blue-500">{karma}</p>
        </div>

        {/* Available Tasks */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Available Tasks</h2>
          <div className="text-gray-400 italic">No tasks available yet. Post a task or check back later.</div>
        </div>
      </main>
    </div>
  );
}