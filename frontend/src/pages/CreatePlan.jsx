// src/pages/CreatePlan.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { plansAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import Spinner from "../components/Spinner";

const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--text-2)",
};

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "0.5px solid var(--border-md)",
  borderRadius: "8px",
  background: "var(--surface)",
  fontSize: "14px",
  color: "var(--text-1)",
  marginBottom: "16px",
  outline: "none",
};

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
    if (maxSpots && (Number(maxSpots) < 1 || Number(maxSpots) > 100)) {
      return toast.error("Max Spots must be between 1 and 100");
    }

    try {
      setSaving(true);
      await plansAPI.createPlan({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        maxSpots: maxSpots ? Number(maxSpots) : null,
      });
      toast.success("Plan created ✅");
      navigate("/home");
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      console.error(err);
      toast.error(message + " ❌");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: "var(--surface-3)", minHeight: "100vh" }}>
      <Toaster position="top-right" reverseOrder={false} />

      <header
        className="sticky top-0 z-10"
        style={{
          background: "var(--surface)",
          borderBottom: "0.5px solid var(--border)",
          padding: "14px 20px",
        }}
      >
        <div className="mx-auto flex items-center justify-between" style={{ maxWidth: "520px" }}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-[8px] px-2 py-1 text-sm"
              style={{
                backgroundColor: "transparent",
                border: "0.5px solid var(--border)",
                color: "var(--text-2)",
              }}
            >
              X
            </button>
            <h1 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-1)" }}>
              New plan
            </h1>
          </div>

          <button
            type="submit"
            form="create-plan-form"
            disabled={saving}
            style={{
              background: "var(--brand)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "7px 16px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {saving ? "Posting..." : "Post"}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "24px 20px" }}>
        <form id="create-plan-form" onSubmit={handleCreate}>
          <label style={labelStyle}>What&apos;s the plan?</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={fieldStyle}
            placeholder="Gym session, coffee run, study group..."
            required
          />

          <label style={labelStyle}>Details</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            rows={3}
            style={fieldStyle}
            placeholder="Any vibe or info (optional)"
          />
          <p style={{ marginTop: "-8px", marginBottom: "16px", fontSize: "11px", color: "var(--text-3)", textAlign: "right" }}>
            {description.length}/300
          </p>

          <label style={labelStyle}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={fieldStyle}
            placeholder="Where's it happening?"
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Starts</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={fieldStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Ends</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={fieldStyle}
              />
            </div>
          </div>

          <label style={labelStyle}>Max spots</label>
          <input
            type="number"
            value={maxSpots}
            onChange={(e) => setMaxSpots(e.target.value)}
            style={fieldStyle}
            placeholder="Unlimited"
            min={1}
            max={100}
          />
        </form>
      </div>
    </div>
  );
}