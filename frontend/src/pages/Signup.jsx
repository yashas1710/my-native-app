// src/pages/Signup.jsx
import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!fullName) return toast.error("Enter your full name");

    try {
      setLoading(true);

      // 1️Create user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // 2️ Generate random avatar URL (for testing)
      const randomAvatar = `https://avatars.dicebear.com/api/identicon/${userCred.user.uid}.svg`;

      // 3️ Update displayName only (no photo)
await updateProfile(auth.currentUser, {
  displayName: fullName,
  
});

// 4️⃣ Create user document in Firestore
await setDoc(doc(db, "users", userCred.user.uid), {
  displayName: fullName,
  email,
  accommodation: "Building A",
  bio: "",
  createdAt: serverTimestamp(),
});


      toast.success("Account created successfully ✅");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-2xl font-bold mb-4">Create Account</h1>

      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        <button
          type="submit"
          className={`bg-brand-dark text-white px-4 py-2 rounded w-full ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}
