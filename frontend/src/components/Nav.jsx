import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Nav() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-200 shadow-xl">
      <div className="flex items-center justify-between px-6 py-3 text-white">

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2">
          <img
            src="/icons/icon-192.png"
            alt="Unplango Logo"
            className="h-8 w-8"
          />
          <span className="text-xl font-extrabold">Unplango</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 font-semibold">
          {["/home", "/plan/create", "/activity"].map((path, i) => (
            <NavLink
              key={i}
              to={path}
              className={({ isActive }) =>
                `hover:scale-110 transition ${
                  isActive ? "text-brand font-bold" : "text-white"
                }`
              }
            >
              {path === "/home" ? "Home" : path === "/plan/create" ? "Create" : "Activity"}
            </NavLink>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:block">
          {user ? (
            <button
              onClick={logout}
              className="bg-red-500 px-4 py-1 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-yellow-400 text-black px-4 py-1 rounded-lg font-bold"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-3xl"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-indigo-600 text-white px-6 py-4 space-y-4">
          <NavLink to="/home" onClick={() => setOpen(false)}>🏠 Home</NavLink>
          <NavLink to="/plan/create" onClick={() => setOpen(false)}>✍️ Create</NavLink>
          <NavLink to="/activity" onClick={() => setOpen(false)}>📊 Activity</NavLink>

          {user ? (
            <button
              onClick={logout}
              className="block w-full bg-red-500 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="block bg-yellow-400 text-black py-2 rounded-lg text-center font-bold"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
