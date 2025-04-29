"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  auth,
  getUserProfile,
  fetchAllTasks,
  deleteTask,
  markTaskComplete,
} from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FiHome, FiClipboard, FiAward, FiUser } from "react-icons/fi";

export default function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [profilePic, setProfilePic] = useState("/default-avatar.png");
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [search, setSearch] = useState("");
  const [dropdownTaskId, setDropdownTaskId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const profile = await getUserProfile(currentUser.uid);
        setUserName(profile?.name || "User");
        setProfilePic(profile?.profilePic || "/default-avatar.png");
        loadTasks();
      } else {
        router.push("/");
      }
    });
    return () => unsub();
  }, [router]);

  const loadTasks = async () => {
    const data = await fetchAllTasks();
    setTasks(data);
  };

  const handleComplete = async (id: string) => {
    await markTaskComplete(id);
    loadTasks();
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    loadTasks();
  };

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-center mb-8 tracking-wide">GoodDeeds</h2>
        <nav className="flex flex-col space-y-6">
          <a href="/dashboard" className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition">
            <FiHome className="text-xl" /> <span>Dashboard</span>
          </a>
          <a href="/tasks" className="flex items-center space-x-3 text-blue-400 font-bold">
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

      {/* Main */}
      <main className="flex-1 p-10 relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Available Tasks</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm bg-gray-700 px-4 py-2 rounded-full text-white hover:bg-gray-600 transition"
          >
            ← Back to Home
          </button>
        </div>

        {/* Header & Search */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full max-w-md p-2 rounded bg-gray-700 text-white border border-gray-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center space-x-3 ml-4">
            <span className="hidden sm:block">{userName}</span>
            <Image
              src={profilePic}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full border-2 border-white shadow"
            />
          </div>
        </div>

        {/* Task List */}
        <div className="grid gap-4">
          {filteredTasks.length === 0 ? (
            <p className="text-gray-400 italic">No tasks found.</p>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="bg-gray-800 p-4 rounded shadow relative">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-400">{task.details}</p>
                    <div className="text-sm mt-2 text-gray-500">
                      {task.tags?.map((tag: string, i: number) => (
                        <span key={i} className="mr-2 text-blue-400">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setDropdownTaskId(dropdownTaskId === task.id ? null : task.id)
                      }
                      className="text-white bg-gray-700 rounded-full px-3 py-1 hover:bg-gray-600"
                    >
                      ⋮
                    </button>
                    {dropdownTaskId === task.id && (
                      <div className="absolute right-0 mt-2 bg-gray-900 border border-gray-700 rounded shadow z-10">
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
                          onClick={() => {
                            handleComplete(task.id);
                            setDropdownTaskId(null);
                          }}
                        >
                          ✅ Mark Complete
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-red-600 text-sm text-red-400"
                          onClick={() => {
                            handleDelete(task.id);
                            setDropdownTaskId(null);
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTask(task)}
                  className="mt-3 text-sm text-blue-300 hover:underline"
                >
                  View More
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-lg w-full max-w-xl shadow-xl border border-gray-700 relative">
              <button
                onClick={() => setSelectedTask(null)}
                className="absolute top-3 right-3 text-white hover:text-red-500"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold mb-2">{selectedTask.title}</h2>
              <p className="text-gray-300 mb-4">{selectedTask.details}</p>
              {selectedTask.context && (
                <div className="text-sm text-gray-500 mb-2">
                  <strong>Context:</strong> {selectedTask.context}
                </div>
              )}
              {selectedTask.reward && (
                <div className="text-sm text-green-400 mb-2">
                  🎁 Reward: {selectedTask.reward}
                </div>
              )}
              <div className="mt-6">
                <label className="block text-gray-400 mb-1">Your Reply:</label>
                <textarea
                  rows={3}
                  className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 resize-none"
                  placeholder="Type your message..."
                ></textarea>
                <button className="mt-3 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition">
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}