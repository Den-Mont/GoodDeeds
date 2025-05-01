"use client";
import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  auth,
  getUserProfile,
  publishTask,
  fetchAllTasks,
} from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FiHome, FiClipboard, FiAward, FiUser } from "react-icons/fi";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState("");
  const [profilePic, setProfilePic] = useState("/default-avatar.png");
  const [karma, setKarma] = useState(100);
  const [tasks, setTasks] = useState<any[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [details, setDetails] = useState("");
  const [detailsError, setDetailsError] = useState(false);
  const [context, setContext] = useState("");
  const [contextError, setContextError] = useState(false);
  const [reward, setReward] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tagList, setTagList] = useState<string[]>([]);
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setUserName(profile.name || "User");
          setProfilePic(profile.profilePic || "/default-avatar.png");
          setKarma(profile.karma ?? 100);
        }
        await loadTasks();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadTasks = async () => {
    const allTasks = await fetchAllTasks();
    setTasks(allTasks.reverse()); // Most recent first
  };

  const handleSubmit = async () => {
    setWasSubmitted(true);
    setSuccessMessage("");

    const isTitleValid = title.trim().length > 0 && title.length <= 80;
    const isDetailsValid = details.trim().length > 0 && details.length <= 500;
    const isContextValid = context.length <= 500;
    const hasTags = tagList.length > 0;

    setTitleError(!isTitleValid);
    setDetailsError(!isDetailsValid);
    setContextError(!isContextValid);

    if (!user) return;

    if (isTitleValid && isDetailsValid && isContextValid && hasTags) {
      try {
        await publishTask({
          userId: user.uid,
          title,
          details,
          context,
          reward,
          tags: tagList,
        });

        setShowForm(false);
        setTitle("");
        setDetails("");
        setContext("");
        setReward("");
        setTagInput("");
        setTagList([]);
        setWasSubmitted(false);
        setSuccessMessage("✅ Task published!");

        await loadTasks();
      } catch (err) {
        console.error("🔥 Task publish failed:", err);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-center mb-8 tracking-wide">GoodDeeds</h2>
        <nav className="flex flex-col space-y-6">
          <a href="/dashboard" className="flex items-center space-x-3 text-blue-400 font-bold">
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

      {/* Main content */}
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-white font-medium hidden sm:block">{userName}</span>
            <Image
              src={profilePic}
              alt="Profile Picture"
              width={40}
              height={40}
              className="rounded-full border-2 border-white shadow"
            />
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
            >
              + Post a Task
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 text-green-400 font-medium">{successMessage}</div>
        )}

        <div className="bg-gray-800 p-6 rounded-lg shadow-md text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-300">Your Karma</h2>
          <p className="text-5xl font-bold text-blue-500">{karma}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Available Tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-gray-400 italic">No tasks available yet.</p>
          ) : (
            <ul className="space-y-4">
              {tasks.map((task) => (
                <li key={task.id} className="bg-gray-700 p-4 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <p className="text-sm text-gray-300">{task.details}</p>
                  <div className="mt-2 text-sm text-blue-400">
                  {task.tags?.map((tag: string, i: number) => (
                    <span key={i} className="mr-2">#{tag}</span>
                  ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Task Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-gray-900 p-6 rounded-lg shadow-2xl border border-gray-700 w-full max-w-2xl mx-4 space-y-6">
              <h2 className="text-2xl font-bold text-white mb-2">Make a Public Task</h2>
              <div className="space-y-4">
                <FormInput label="Title" value={title} onChange={setTitle} error={titleError} max={80} wasSubmitted={wasSubmitted} />
                <FormTextArea label="Details" value={details} onChange={setDetails} error={detailsError} max={500} wasSubmitted={wasSubmitted} />
                <FormTextArea label="Context (optional)" value={context} onChange={setContext} error={contextError} max={500} wasSubmitted={wasSubmitted} />
                <FormInput label="Reward (optional)" value={reward} onChange={setReward} />
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Tags:</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        e.preventDefault();
                        const newTag = tagInput.trim().toLowerCase();
                        if (!tagList.includes(newTag)) {
                          setTagList([...tagList, newTag]);
                        }
                        setTagInput("");
                      }
                    }}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
                    placeholder="Press Enter to add tags"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tagList.map((tag, i) => (
                      <span
                        key={i}
                        onClick={() => setTagList(tagList.filter((t) => t !== tag))}
                        className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-red-600 transition"
                        title="Click to remove"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    className="bg-green-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-green-700 transition"
                  >
                    Submit Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper components
function FormInput({ label, value, onChange, error = false, max, wasSubmitted = false }) {
  const isInvalid = wasSubmitted && (!value.trim() || (max && value.length > max));
  return (
    <div>
      <label className="block text-gray-300 font-medium mb-1">{label}:</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 rounded border ${
          isInvalid ? "bg-red-950 border-red-500 text-red-300" : "bg-gray-700 border-gray-600 text-white"
        }`}
      />
      {isInvalid && (
        <p className="text-sm text-red-400 mt-1">
          {value.trim() === "" ? `${label} is required.` : `${label} must be under ${max} characters.`}
        </p>
      )}
    </div>
  );
}

function FormTextArea({ label, value, onChange, error = false, max, wasSubmitted = false }) {
  const isInvalid = wasSubmitted && (!value.trim() && label !== "Context (optional)" || (max && value.length > max));
  return (
    <div>
      <label className="block text-gray-300 font-medium mb-1">{label}:</label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 rounded border ${
          isInvalid ? "bg-red-950 border-red-500 text-red-300" : "bg-gray-700 border-gray-600 text-white"
        }`}
      />
      {isInvalid && (
        <p className="text-sm text-red-400 mt-1">
          {value.trim() === "" ? `${label} is required.` : `${label} must be under ${max} characters.`}
        </p>
      )}
    </div>
  );
}