// src/pages/CreatePlan.jsx
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

export default function CreatePlan() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [datetime, setDatetime] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !datetime) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "plans"), {
        title,
        description,
        datetime,
        creator_id: user.uid,
        created_at: new Date().toISOString(),
      });
      setSuccess(true);
      setTitle("");
      setDescription("");
      setDatetime("");
    } catch (error) {
      console.error("Error creating plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="p-6">Please login to create a plan.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-heading font-bold mb-6 text-brand-dark">
        Create a New Plan
      </h1>

      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          ✅ Plan created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:ring-brand focus:border-brand"
            placeholder="Enter plan title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:ring-brand focus:border-brand"
            placeholder="Enter plan details"
            rows="3"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:ring-brand focus:border-brand"
            required
          />
        </div>

        <Button type="submit" variant="primary">
          {loading ? "Creating..." : "Create Plan"}
        </Button>
      </form>
    </div>
  );
}
