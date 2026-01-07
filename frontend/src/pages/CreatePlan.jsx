import { useState } from "react";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import toast from "react-hot-toast";

export default function CreatePlan() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // 🔥 fetch user profile from users collection
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        toast.error("User profile not found");
        return;
      }

      const userData = userSnap.data();

      await addDoc(collection(db, "plans"), {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdAt: serverTimestamp(),

        // permissions
        createdBy: auth.currentUser.uid,

        // display
        creatorName: userData.displayName,
        creatorPhoto: userData.photoURL,
      });

      toast.success("Plan created ✅");
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Plan</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border p-2" required />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full border p-2" required />
        <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border p-2" required />
        <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border p-2" required />

        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded">
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
