// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../components/Spinner";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setFullName(data.fullName || "");
        setBio(data.bio || "");
        setPhotoURL(data.photoURL || "");
        setEmail(data.email || user.email || "");
        setCreatedAt(data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : "");
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(),
        bio: bio.trim(),
        photoURL,
      });
      toast.success("Profile updated ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile ❌");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large (max 2MB) ❌");
      return;
    }
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Only JPG/PNG allowed ❌");
      return;
    }

    try {
      const storageRef = ref(storage, `profilePics/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
      toast.success("Photo uploaded ✅");
    } catch (err) {
      console.error(err);
      toast.error("Photo upload failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
      >
        ← Back
      </button>

      {/* Profile Card */}
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-400 mb-3 hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-300 mb-3" />
          )}
          <label className="cursor-pointer bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition">
            Upload Photo
            <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
          </label>
        </div>

        {/* Full Name */}
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full border rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Full Name"
        />

        {/* Bio */}
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-black dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          placeholder="Bio"
        />

        {/* Extra Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>📧 Email: <span className="font-medium">{email}</span></p>
          {createdAt && <p>📅 Joined: <span className="font-medium">{createdAt}</span></p>}
        </div>

        {/* Save Button */}
        <div className="text-center">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <Spinner /> <span>Saving...</span>
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
