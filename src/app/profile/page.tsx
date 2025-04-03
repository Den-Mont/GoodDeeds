"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { saveUserProfile, getUserProfile, uploadProfilePicture } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState("/default-avatar.png");
  const [bio, setBio] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("User authenticated:", currentUser.uid);
        setUser(currentUser);
        const profileData = await getUserProfile(currentUser.uid);
        console.log("Fetched profile data:", profileData);

        if (profileData) {
          setName(profileData.name || "");
          setBio(profileData.bio || "");
          setProfilePic(profileData.profilePic || "/default-avatar.png");
        }
      } else {
        router.push("/"); // redirect if not logged in
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Handle profile picture upload
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      try {
        console.log("Selected file:", file.name);
        const imageUrl = await uploadProfilePicture(user.uid, file);
        console.log("Image URL returned:", imageUrl);

        if (imageUrl) {
          setProfilePic(imageUrl);
          await saveUserProfile(user.uid, name, bio, imageUrl);
          console.log("Profile picture saved to Firestore:", imageUrl);
        } else {
          console.warn("Image URL was null — upload may have failed.");
        }
      } catch (error) {
        console.error("Error uploading or saving profile picture:", error);
      }
    }
  };

  // Save all fields
  const handleSave = async () => {
    if (user) {
      try {
        console.log("Saving profile:", { name, bio, profilePic });
        await saveUserProfile(user.uid, name, bio, profilePic);
        console.log("Profile manually saved.");
        router.push("/profile");
      } catch (error) {
        console.error("Error saving profile:", error);
      }
    }
  };

  if (loading) {
    return <p className="text-white text-center mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      {/* Profile Picture */}
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

      {/* Name Input */}
      <div className="mt-6 w-80">
        <label className="block text-gray-300">Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-2 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Bio Input */}
      <div className="mt-4 w-80">
        <label className="block text-gray-300">Bio:</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full mt-2 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="mt-6 bg-blue-600 px-6 py-2 rounded-full shadow-md hover:bg-blue-700 transition"
      >
        Save Changes
      </button>
    </div>
  );
}