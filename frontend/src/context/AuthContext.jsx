import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authAPI } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  // Restore session on refresh
  useEffect(() => {
    const initAuth = async () => {
      const savedToken =
        localStorage.getItem("token");

      const savedUser =
        localStorage.getItem("user");

      if (savedToken && savedUser) {
        try {
          const response =
            await authAPI.getMe();

          setUser(response.data.user);
        } catch (err) {
          console.error(
            "Session restore failed:",
            err
          );

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          setError(
            "Session expired. Please login again."
          );
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const signup = async (
    name,
    email,
    password,
    accommodationId
  ) => {
    try {
      setError(null);

      const response =
        await authAPI.signup(
          name,
          email,
          password,
          accommodationId
        );

      const { token, user } =
        response.data;

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      setUser(user);

      return {
        success: true,
        user,
      };
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message;

      setError(message);

      throw new Error(message);
    }
  };

  const login = async (
    email,
    password
  ) => {
    try {
      setError(null);

      const response =
        await authAPI.login(
          email,
          password
        );

      const { token, user } =
        response.data;

      localStorage.setItem(
        "token",
        token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      setUser(user);

      return {
        success: true,
        user,
      };
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "Login failed";

      setError(message);

      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return ctx;
}