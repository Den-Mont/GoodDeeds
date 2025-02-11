"use client";

import { useState } from "react";

const LoginButton = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="flex space-x-4">
      {isLoggedIn ? (
        <button 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition" 
          onClick={handleLogout}
        >
          Logout
        </button>
      ) : (
        <>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition" 
            onClick={handleLogin}
          >
            Login
          </button>
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  );
};

export default LoginButton;