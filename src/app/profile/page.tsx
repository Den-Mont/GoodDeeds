"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { saveUserProfile, getUserProfile, uploadProfilePicture } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState("/default-avatar.png");
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [karma, setKarma] = useState(100); // Placeholder
  const [tasks, setTasks] = useState<string[]>([]); // Placeholder
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const profileData = await getUserProfile(currentUser.uid);
        if (profileData) {
          setName(profileData.name || "");
          setBio(profileData.bio || "");
          setProfilePic(profileData.profilePic || "/default-avatar.png");
        }
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      try {
        const imageUrl = await uploadProfilePicture(user.uid, file);
        if (imageUrl) {
          setProfilePic(imageUrl);
          await saveUserProfile(user.uid, name, bio, imageUrl);
        }
      } catch (error) {
        console.error("Error uploading or saving profile picture:", error);
      }
    }
  };

  const handleSave = async () => {
    if (user) {
      try {
        await saveUserProfile(user.uid, name, bio, profilePic);
        setEditMode(false);
      } catch (error) {
        console.error("Error saving profile:", error);
      }
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
    return <p className="text-white text-center mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm bg-gray-700 px-4 py-2 rounded-full text-white hover:bg-gray-600 transition"
        >
          ← Back to Dashboard
        </button>

        {/* Dropdown Menu */}
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button
            className="bg-gray-800 px-4 py-2 rounded-full text-white hover:bg-gray-700 transition"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            ☰
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm text-white"
                onClick={() => {
                  setEditMode(true);
                  setDropdownOpen(false);
                }}
              >
                Edit Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-red-700 text-sm text-red-400"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {!editMode ? (
        <div className="flex flex-col items-center">
          <Image
            src={profilePic}
            alt="Profile"
            width={120}
            height={120}
            className="rounded-full border-4 border-gray-700 shadow-md object-cover"
          />
          <p className="mt-4 text-xl font-semibold">{name}</p>
          <p className="text-gray-400 italic">{bio}</p>
          <p className="mt-4 text-blue-400 font-medium">Karma: {karma}</p>

          <div className="mt-6 w-full max-w-md bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-white mb-2">Your Tasks</h2>
            {tasks.length > 0 ? (
              <ul className="list-disc list-inside text-gray-300">
                {tasks.map((task, i) => (
                  <li key={i}>{task}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic">No tasks yet. Coming soon!</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <label className="relative cursor-pointer">
            <Image
              src={profilePic}
              alt="Profile Picture"
              width={120}
              height={120}
              className="rounded-full border-4 border-gray-700 shadow-md object-cover"
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
          <p className="text-sm text-gray-400 mt-2">Click to change profile picture</p>

          <div className="mt-6 w-80">
            <label className="block text-gray-300">Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4 w-80">
            <label className="block text-gray-300">Bio:</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full mt-2 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleSave}
            className="mt-6 bg-green-600 px-6 py-2 rounded-full shadow-md hover:bg-green-700 transition"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}