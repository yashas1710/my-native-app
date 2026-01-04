import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

export default function EditPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const planRef = doc(db, "plans", id);
        const planSnap = await getDoc(planRef);
        if (planSnap.exists()) {
          const data = planSnap.data();
          setTitle(data.title);
          setDescription(data.description);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch plan ❌");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, "plans", id), { title, description });
      toast.success("Plan updated ✅");
      navigate(`/plan/${id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update plan ❌");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Plan</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded p-2 mb-4"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border rounded p-2 mb-4"
      />
      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Update Plan
      </button>
    </div>
  );
}
