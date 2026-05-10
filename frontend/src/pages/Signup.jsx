// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accommodationId, setAccommodationId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Name is required");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (!accommodationId.trim()) {
      return toast.error("Accommodation ID is required");
    }

    try {
      setLoading(true);
      await signup(name.trim(), email, password, accommodationId.trim());
      toast.success("Signup successful ✅");
      navigate("/");
    } catch (err) {
      console.error(err);
      const message = err.message || "Signup failed";
      toast.error(message + " ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-black dark:text-white"
            placeholder="Full Name"
            required
          />

          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-black dark:text-white"
            placeholder="Email"
            required
          />

          {/* Password */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-black dark:text-white"
            placeholder="Password (min 6 chars)"
            required
          />

          {/* Accommodation ID */}
          <input
            type="text"
            value={accommodationId}
            onChange={(e) => setAccommodationId(e.target.value)}
            className="w-full border rounded p-2 bg-white dark:bg-gray-800 text-black dark:text-white"
            placeholder="Accommodation ID (e.g., hall-a, dorm-b)"
            required
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
