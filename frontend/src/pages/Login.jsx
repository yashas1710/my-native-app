// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
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

export default function Login() {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🚀 Starting login process...');
      await login(email, password);
      toast.success("Logged in successfully ✅");
      navigate("/");
    } catch (err) {
      console.error('💥 Login error caught in component:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const message = err.message || "Login failed";
      toast.error(message + " ❌");
      
      // Also log to console for debugging
      console.log('🔴 Login failed with message:', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "400px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#4f46e5", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700 }}>
            ⚡
          </div>
        </div>

        <h1 style={{ fontSize: "22px", fontWeight: 600, textAlign: "center", letterSpacing: "-0.4px", color: "var(--text-1)" }}>
          Welcome back
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-2)", textAlign: "center", marginTop: "4px", marginBottom: "24px" }}>
          Sign in to see what&apos;s on
        </p>

        <form onSubmit={handleSubmit}>
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
            style={{ ...inputStyle, marginBottom: "8px" }}
            placeholder="Password"
            required
          />

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
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {error ? (
            <div style={{ marginTop: "8px", color: "#DC2626", fontSize: "13px" }}>
              {error}
            </div>
          ) : null}
        </form>

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--text-2)" }}>
          Don&apos;t have an account?{" "}
          <Link to="/signup" style={{ color: "var(--brand)", cursor: "pointer" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
