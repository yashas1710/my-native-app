// src/pages/CreatePlan.jsx
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function CreatePlan() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxSpots, setMaxSpots] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !location || !startDate) {
      return toast.error("Title, Location, and Start Time are required");
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "plans"), {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxSpots: maxSpots ? Number(maxSpots) : null,
        createdBy: user.uid,
        creatorName: user.displayName || "Anonymous",
        creatorPhotoURL: user.photoURL,
        accommodation: user.accommodation || "Building A", // ✅ inherit from user
        createdAt: serverTimestamp(),
      });

      toast.success("Plan created successfully ✅");
      navigate("/"); // go back to Home Feed
    } catch (err) {
      console.error(err);
      toast.error("Failed to create plan ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Toaster position="top-right" reverseOrder={false} />
      <h1 className="text-2xl font-bold mb-4">Create Plan</h1>

      <form onSubmit={handleCreate} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <label>
          Start Time
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded p-2"
            required
          />
        </label>
        <label>
          End Time (optional)
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded p-2"
          />
        </label>
        <input
          type="number"
          placeholder="Max Spots (optional)"
          value={maxSpots}
          onChange={(e) => setMaxSpots(e.target.value)}
          className="w-full border rounded p-2"
          min={1}
        />

        <button
          type="submit"
          className={`bg-brand-dark text-white px-4 py-2 rounded w-full ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Plan"}
        </button>
      </form>
    </div>
  );
}
