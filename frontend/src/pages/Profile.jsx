// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { authAPI, plansAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "0.5px solid var(--border-md)",
  borderRadius: "8px",
  background: "var(--surface)",
  fontSize: "14px",
  color: "var(--text-1)",
  outline: "none",
};

export default function Profile() {
  const { user, setUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [createdCount, setCreatedCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const formatCreatedAt = (value) => {
    if (!value) return "";
    if (typeof value?.toDate === "function") {
      return value.toDate().toLocaleDateString();
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
  };

  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        const [createdResponse, joinedResponse] = await Promise.all([
          plansAPI.getMyCreatedPlans(),
          plansAPI.getMyJoinedPlans(),
        ]);

        setCreatedCount(createdResponse.data.plans?.length || 0);
        setJoinedCount(joinedResponse.data.plans?.length || 0);
      } catch (err) {
        console.error(err);
      }
    };

    setFullName(user.name || "");
    setBio(user.bio || "");
    setPhotoURL(user.photoUrl || "");
    setEmail(user.email || "");
    setCreatedAt(formatCreatedAt(user.createdAt));
    fetchCounts();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await authAPI.updateProfile({
        name: fullName.trim(),
        bio: bio.trim(),
        photoUrl: photoURL,
      });

      const updatedUser = response.data.user;
      setFullName(updatedUser.name || "");
      setBio(updatedUser.bio || "");
      setPhotoURL(updatedUser.photoUrl || "");

      toast.success("Profile updated ✅");
      setUser((prev) => ({ ...prev, name: fullName.trim(), bio: bio.trim(), photoUrl: photoURL }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile ❌");
    } finally {
      setLoading(false);
    }
  };

  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div style={{ background: "var(--surface-3)", minHeight: "100vh" }}>
      <Toaster position="top-right" reverseOrder={false} />

      <div
        style={{
          background: "var(--surface)",
          borderBottom: "0.5px solid var(--border)",
          padding: "28px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <label
          style={{
            position: "relative",
            width: "72px",
            height: "72px",
            borderRadius: "9999px",
            background: "var(--brand-light)",
            color: "var(--brand)",
            fontSize: "22px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            userSelect: "none",
            overflow: "hidden",
          }}
        >
          {photoURL ? (
            <img
              src={photoURL}
              alt={fullName || "avatar"}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "9999px" }}
            />
          ) : (
            <span>{initials || "?"}</span>
          )}

        </label>

        <div
          style={{
            marginTop: "12px",
            fontSize: "17px",
            fontWeight: 600,
            letterSpacing: "-0.3px",
            color: "var(--text-1)",
          }}
        >
          {fullName || "Your profile"}
        </div>

        <div style={{ marginTop: "4px", fontSize: "13px", color: "var(--text-2)", textAlign: "center" }}>
          {bio || "Add a short bio for your profile."}
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "32px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-1)" }}>{createdCount}</div>
            <div style={{ fontSize: "11px", color: "var(--text-3)" }}>Created</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-1)" }}>{joinedCount}</div>
            <div style={{ fontSize: "11px", color: "var(--text-3)" }}>Joined</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-1)" }}>{createdCount + joinedCount}</div>
            <div style={{ fontSize: "11px", color: "var(--text-3)" }}>Total</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "420px", margin: "0 auto", padding: "24px 20px" }}>
        <div
          style={{
            marginBottom: "16px",
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          Edit profile
        </div>

        <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", fontWeight: 500, color: "var(--text-2)" }}>
          Name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ ...inputStyle, marginBottom: "16px" }}
          placeholder="Full name"
        />

        <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", fontWeight: 500, color: "var(--text-2)" }}>
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          style={{ ...inputStyle, minHeight: "92px", resize: "vertical", marginBottom: "16px" }}
          placeholder="Tell people a little about you"
        />

        <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", fontWeight: 500, color: "var(--text-2)" }}>
          Email
        </label>
        <input
          type="text"
          value={email}
          disabled
          style={{ ...inputStyle, marginBottom: "24px", opacity: 0.75 }}
        />

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            width: "100%",
            background: "var(--brand)",
            color: "white",
            borderRadius: "8px",
            padding: "11px",
            fontSize: "14px",
            fontWeight: 500,
            border: "none",
            opacity: loading ? 0.7 : 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          <span style={{ opacity: loading ? 0.7 : 1 }}>{loading ? "Saving..." : "Save"}</span>
        </button>

        {createdAt ? (
          <div style={{ marginTop: "16px", textAlign: "center", fontSize: "11px", color: "var(--text-3)" }}>
            Joined {createdAt}
          </div>
        ) : null}
      </div>
    </div>
  );
}
