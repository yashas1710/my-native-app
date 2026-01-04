// src/pages/CreatePlan.jsx
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { validatePlanDates } from "../utils/validatePlanDates";
import toast, { Toaster } from "react-hot-toast";

export default function CreatePlan() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Title/Description validation
    if (title.length < 5 || title.length > 50) {
      toast.error("Title must be between 5 and 50 characters");
      return;
    }

    if (description.length < 10 || description.length > 300) {
      toast.error("Description must be between 10 and 300 characters");
      return;
    }

    // ✅ Date validation
    const { valid, message } = validatePlanDates(startDate, endDate);
    if (!valid) {
      toast.error(message);
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "plans"), {
        title,
        description,
        startDate: new Date(startDate),   // converts string → Date → Firestore Timestamp
        endDate: new Date(endDate),
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || "anonymous",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");

      toast.success("Plan created successfully ✅");
    } catch (err) {
      console.error("Error creating plan:", err);
      toast.error("Failed to create plan ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      {/* ✅ Toaster for toast notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      <h1 className="text-2xl font-bold mb-4">Create New Plan</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <input
          type="text"
          placeholder="Plan Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded p-2"
          required
          minLength={5} // HTML validation fallback
          maxLength={50}
        />

        {/* Description */}
        <textarea
          placeholder="Plan Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2"
          required
          minLength={10}
          maxLength={300}
        />

        {/* Start Date + Time */}
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        {/* End Date + Time */}
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border rounded p-2"
          required
        />

        {/* Submit Button with loading state */}
        <button
          type="submit"
          className={`bg-brand-dark text-white px-4 py-2 rounded hover:bg-brand-light transition ${
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
