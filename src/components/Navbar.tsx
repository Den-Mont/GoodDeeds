"use client";
import { useState } from "react";
import Image from "next/image"; // Import Next.js Image component
import AuthForm from "./AuthForm";

const Navbar = () => {
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);

  const toggleAuth = (mode: "login" | "signup") => {
    setAuthMode((prevMode) => (prevMode === mode ? null : mode));
  };

  return (
    <>
      <nav className="w-full flex justify-between items-center p-4 bg-gray-900 text-white relative z-50">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="GoodDeeds Logo" width={60} height={60} />
          <h1 className="text-xl font-bold">GoodDeeds</h1>
        </div>

        <div className="flex space-x-4">
          <button
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => toggleAuth("login")}
          >
            Log In
          </button>
          <button
            className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
            onClick={() => toggleAuth("signup")}
          >
            Sign Up
          </button>
        </div>
      </nav>
      
      {authMode && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={() => setAuthMode(null)} // Click outside to close modal
        >
          <div className="relative bg-gray-800 p-6 rounded-lg shadow-md" onClick={(e) => e.stopPropagation()}>
            <AuthForm mode={authMode} setAuthMode={setAuthMode} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;