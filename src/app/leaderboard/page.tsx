"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FiHome, FiClipboard, FiAward, FiUser } from "react-icons/fi";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const usersQuery = query(collection(db, "users"), orderBy("karma", "desc"), limit(20));
        const snapshot = await getDocs(usersQuery);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(results);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    fetchTopUsers();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
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
          <a href="/leaderboard" className="flex items-center space-x-3 text-blue-400 font-bold transition">
            <FiAward className="text-xl" /> <span>Leaderboard</span>
          </a>
          <a href="/profile" className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition">
            <FiUser className="text-xl" /> <span>Profile</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <h1 className="text-3xl font-semibold mb-8">🏆 Leaderboard</h1>

        {users.length === 0 ? (
          <p className="text-gray-400 italic">No users found.</p>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <ul className="space-y-4">
              {users.map((user, index) => (
                <li key={user.id} className="flex items-center justify-between border-b border-gray-700 pb-2">
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold text-blue-400 w-8 text-center">
                      {index + 1}
                    </span>
                    <Image
                      src={user.profilePic || "/default-avatar.png"}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full border border-gray-600"
                    />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.karma} Karma</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}