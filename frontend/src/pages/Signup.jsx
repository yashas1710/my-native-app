// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

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

const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontSize: "12px",
  fontWeight: 500,
  color: "var(--text-2)",
};

export default function Signup() {
  const navigate = useNavigate();
  const { signup, error } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accommodationId, setAccommodationId] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Name is required");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (!accommodationId.trim()) {
      return toast.error("Accommodation ID is required");
    }

    try {
      setLoading(true);
      await signup(name.trim(), email, password, accommodationId.trim(), gender || undefined);
      toast.success("Signup successful ✅");
      navigate("/");
    } catch (err) {
      console.error(err);
      const message = err.message || "Signup failed";
      toast.error(message + " ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <Toaster position="top-right" reverseOrder={false} />
      <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "400px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#4f46e5", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700 }}>
            ⚡
          </div>
        </div>

        <h1 style={{ fontSize: "22px", fontWeight: 600, textAlign: "center", letterSpacing: "-0.4px", color: "var(--text-1)" }}>
          Create account
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-2)", textAlign: "center", marginTop: "4px", marginBottom: "24px" }}>
          Join your accommodation&apos;s plans
        </p>

        <form onSubmit={handleSignup}>
          <label style={labelStyle}>Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ ...inputStyle, marginBottom: "16px" }}
            placeholder="Full Name"
            required
          />

          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ ...inputStyle, marginBottom: "16px" }}
            placeholder="Email"
            required
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, marginBottom: "16px" }}
            placeholder="Password (min 6 chars)"
            required
          />

          <label style={labelStyle}>Your building or hall</label>
          <input
            type="text"
            value={accommodationId}
            onChange={(e) => setAccommodationId(e.target.value)}
            style={{ ...inputStyle, marginBottom: "16px" }}
            placeholder="Accommodation ID (e.g., hall-a, dorm-b)"
            required
          />

          <label style={labelStyle}>Gender (Optional)</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{ ...inputStyle, marginBottom: "8px" }}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "var(--brand)",
              color: "white",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 500,
              border: "none",
              marginTop: "8px",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          {error ? (
            <div style={{ marginTop: "8px", color: "#DC2626", fontSize: "13px" }}>
              {error}
            </div>
          ) : null}
        </form>

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--text-2)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--brand)", cursor: "pointer" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
