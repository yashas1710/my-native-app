import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader"; // optional spinner

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />; // 👈 show loader until auth resolves
  return user ? children : <Navigate to="/login" replace />;
}
