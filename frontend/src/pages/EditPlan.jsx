// src/pages/EditPlan.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { plansAPI } from "../api";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../components/Spinner";

export default function EditPlan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxSpots, setMaxSpots] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await plansAPI.getPlanById(id);
        const data = response.data.plan;

        setTitle(data.title || "");
        setDescription(data.description || "");
        setLocation(data.location || "");

        if (data.startDate) {
          const date = new Date(data.startDate);
          setStartDate(date.toISOString().slice(0, 16));
        }

        if (data.endDate) {
          const date = new Date(data.endDate);
          setEndDate(date.toISOString().slice(0, 16));
        }

        setMaxSpots(data.maxSpots || "");
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch plan ❌");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id, navigate]);

  const handleUpdate = async (e) => {
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
    if (maxSpots && (Number(maxSpots) < 1 || Number(maxSpots) > 100)) {
      return toast.error("Max Spots must be between 1 and 100");
    }

    try {
      setSaving(true);

      await plansAPI.updatePlan(id, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        maxSpots: maxSpots ? Number(maxSpots) : null,
      });

      toast.success("Plan updated ✅");
      navigate(`/plan/${id}`);
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      console.error(err);
      toast.error(message + " ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-600 dark:text-blue-400">
          ✏️ Edit Plan
        </h1>

        <form onSubmit={handleUpdate} className="space-y-5">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Title"
            required
          />

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="Description (max 300 chars)"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description.length}/300
          </p>

          {/* Location */}
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Location"
            required
          />

          {/* Start Time */}
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          {/* End Time */}
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Max Spots */}
          <input
            type="number"
            value={maxSpots}
            onChange={(e) => setMaxSpots(e.target.value)}
            className="w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
            placeholder="Max Spots (1–100)"
            min={1}
            max={100}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg w-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {saving ? (
              <>
                <Spinner /> <span>Updating...</span>
              </>
            ) : (
              "Update Plan"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

