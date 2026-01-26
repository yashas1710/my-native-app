// src/pages/EditPlan.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
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
  const [creatorName, setCreatorName] = useState("");
  const [creatorPhotoURL, setCreatorPhotoURL] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const planRef = doc(db, "plans", id);
        const planSnap = await getDoc(planRef);
        if (planSnap.exists()) {
          const data = planSnap.data();
          setTitle(data.title || "");
          setDescription(data.description || "");
          setLocation(data.location || "");
          setStartDate(
            data.startDate
              ? new Date(data.startDate.seconds * 1000).toISOString().slice(0, 16)
              : ""
          );
          setEndDate(
            data.endDate
              ? new Date(data.endDate.seconds * 1000).toISOString().slice(0, 16)
              : ""
          );
          setMaxSpots(data.maxSpots || "");
          setCreatorName(data.creatorName || "Anonymous");
          setCreatorPhotoURL(data.creatorPhotoURL || "");
          setCreatedBy(data.createdBy || "");
        } else {
          toast.error("Plan not found ❌");
          navigate("/");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch plan ❌");
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
    if (maxSpots && (Number(maxSpots) < 1 || Number(maxSpots) > 50)) {
      return toast.error("Max Spots must be between 1 and 50");
    }

    try {
      setSaving(true);

      // 🔑 Always re-fetch creator profile to avoid "Unknown"
      let creatorNameFinal = creatorName;
      let creatorPhotoFinal = creatorPhotoURL;

      if (createdBy) {
        const uSnap = await getDoc(doc(db, "users", createdBy));
        if (uSnap.exists()) {
          const u = uSnap.data();
          creatorNameFinal =
            u.fullName || u.displayName || u.email || "Unknown";
          creatorPhotoFinal = u.photoURL || "";
        }
      }

      await updateDoc(doc(db, "plans", id), {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxSpots: maxSpots ? Number(maxSpots) : null,
        createdBy,
        creatorName: creatorNameFinal,
        creatorPhotoURL: creatorPhotoFinal,
      });

      toast.success("Plan updated ✅");
      navigate(`/plan/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update plan ❌");
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
            placeholder="Max Spots (1–50)"
            min={1}
            max={50}
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
