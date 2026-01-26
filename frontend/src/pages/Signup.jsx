// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import toast, { Toaster } from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      return toast.error("Full name is required");
    }

    try {
      setLoading(true);

      // Create user in Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase Auth profile with displayName
      await updateProfile(user, { displayName: fullName });

      // Save user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(),
        email: user.email,
        photoURL: user.photoURL || "",
        createdAt: new Date(),
      });

      toast.success("Signup successful ✅");
      navigate("/activity");
    } catch (err) {
      console.error(err);
      toast.error("Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

      <form onSubmit={handleSignup} className="space-y-4">
        {/* Full Name */}
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
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
          placeholder="Password"
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
    </div>
  );
}
