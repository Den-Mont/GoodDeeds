"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Import Next.js router
import { registerWithEmail, loginWithEmail, loginWithGoogle } from "@/lib/firebase";

const AuthForm = ({ mode, setAuthMode }: { mode: "login" | "signup"; setAuthMode: (mode: "login" | "signup" | null) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Store error messages
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error message before attempting login/signup

    try {
      if (mode === "signup") {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      setAuthMode(null); // Close modal on success
      router.push("/dashboard"); // Redirect on success
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);

      // ✅ Firebase Error Handling
      switch (err.code) {
        case "auth/invalid-email":
          setError("❌ Invalid email format.");
          break;
        case "auth/user-not-found":
          setError("❌ No user found with this email.");
          break;
        case "auth/wrong-password":
          setError("❌ Incorrect password. Please try again.");
          break;
        case "auth/email-already-in-use":
          setError("❌ This email is already registered.");
          break;
        case "auth/weak-password":
          setError("❌ Password should be at least 6 characters.");
          break;
        case "auth/invalid-credential":
          setError("❌ Incorrect email or password.");
          break;
        default:
          setError("❌ Authentication failed. Please try again.");
      }
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md w-80 border border-gray-700">
      <h2 className="text-lg font-bold mb-4">{mode === "signup" ? "Sign Up" : "Log In"}</h2>

      {/* Show Error Message If Exists */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-2 p-2 rounded bg-gray-700 text-white focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2 p-2 rounded bg-gray-700 text-white focus:outline-none"
          required
        />
        <button type="submit" className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
          {mode === "signup" ? "Sign Up" : "Log In"}
        </button>
      </form>

      {/* Google Login / Sign Up */}
      <button
        onClick={async () => {
          setError(""); // Reset error before Google login
          try {
            await loginWithGoogle();
            setAuthMode(null);
            router.push("/dashboard");
          } catch (err: any) {
            setError("❌ Google login failed. Please try again.");
            console.error("Google Auth error:", err.message);
          }
        }}
        className="mt-4 bg-red-500 px-4 py-2 rounded hover:bg-red-600"
      >
        {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
      </button>

      {/* Switch between login and signup */}
      <button
        className="mt-4 text-sm text-blue-400 hover:underline"
        onClick={() => setAuthMode(mode === "signup" ? "login" : "signup")}
      >
        {mode === "signup" ? "Already have an account? Log in" : "Don't have an account? Sign up"}
      </button>
    </div>
  );
};

export default AuthForm;