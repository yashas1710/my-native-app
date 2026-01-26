// src/pages/CreatePlan.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../components/Spinner";

export default function CreatePlan() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxSpots, setMaxSpots] = useState("");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({});

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!title.trim() || !location.trim() || !startDate) {
      return toast.error("Title, Location, and Start Time are required");
    }
    if (description.length > 300) {
      return toast.error("Description must be under 300 characters");
    }
    if (endDate && new Date(endDate) < new Date(startDate)) {
      return toast.error("End Time must be after Start Time");
    }
    if (maxSpots && (Number(maxSpots) < 1 || Number(maxSpots) > 50)) {
      return toast.error("Max Spots must be between 1 and 50");
    }

    try {
      setSaving(true);
      await addDoc(collection(db, "plans"), {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxSpots: maxSpots ? Number(maxSpots) : null,
        createdBy: user.uid,
        creatorName: profile.fullName || user.displayName || "Unknown",
        creatorPhotoURL: profile.photoURL || user.photoURL || "",
        createdAt: serverTimestamp(),
      });
      toast.success("Plan created ✅");
      navigate("/activity");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create plan ❌");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-black dark:text-white flex items-center justify-center p-6">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-600 dark:text-blue-400">
          🚀 Create a New Plan
        </h1>

        <form onSubmit={handleCreate} className="space-y-5">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Plan Title"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="Description (max 300 chars)"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{description.length}/300</p>

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Location"
            required
          />

          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="number"
            value={maxSpots}
            onChange={(e) => setMaxSpots(e.target.value)}
            className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            placeholder="Max Spots (1–50)"
            min={1}
            max={50}
          />

          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg w-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {saving ? (
              <>
                <Spinner /> <span>Creating...</span>
              </>
            ) : (
              "Create Plan"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
