import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItemBase =
  "inline-flex items-center px-2 py-1 transition-colors duration-200";
const navItemInactive = "text-[var(--text-2)] font-normal";
const navItemActive = "text-[var(--text-1)] font-medium";

function getInitials(name) {
  if (!name) return "?";

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";

  const first = parts[0]?.[0] || "";
  const last = parts[parts.length - 1]?.[0] || "";
  return `${first}${last}`.toUpperCase() || "?";
}

export default function Nav() {
  const { user, isAuthenticated } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) return saved === "true";

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
      return;
    }

    document.documentElement.classList.remove("dark");
    localStorage.setItem("darkMode", "false");
  }, [darkMode]);

  const initials = getInitials(user?.name);

  return (
    <nav
      className="sticky top-0 z-50 bg-white dark:bg-[var(--surface)]"
      style={{ borderBottom: "0.5px solid var(--border)" }}
    >
      <div className="h-[56px] px-6 flex items-center gap-4">
        <div className="flex items-center shrink-0">
          <Link to="/home" className="flex items-center gap-2">
            <span
              className="flex h-[28px] w-[28px] items-center justify-center text-[14px] text-white"
              style={{ backgroundColor: "var(--brand)", borderRadius: 7 }}
              aria-hidden="true"
            >
              ⚡
            </span>
            <span
              className="text-[15px] font-semibold tracking-[-0.3px]"
              style={{ color: "var(--text-1)" }}
            >
              Un<span style={{ color: "var(--brand)" }}>plan</span>go
            </span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center gap-8">
          {isAuthenticated && (
            <>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/activity"
                className={({ isActive }) =>
                  `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
                }
              >
                Activity
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
                }
              >
                Profile
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated && (
            <>
              <Link
                to="/create"
                className="inline-flex items-center justify-center rounded-[8px] px-[14px] py-[7px] text-[13px] font-medium text-white"
                style={{ backgroundColor: "var(--brand)" }}
              >
                Create
              </Link>

              <Link
                to="/profile"
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full text-[11px] font-semibold"
                style={{ backgroundColor: "var(--brand-light)", color: "var(--brand)" }}
                aria-label="Go to profile"
              >
                {initials}
              </Link>

              <button
                type="button"
                onClick={() => setDarkMode((current) => !current)}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px]"
                style={{ border: "0.5px solid var(--border)" }}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                <span className="text-[14px] leading-none">
                  {darkMode ? "☀" : "☾"}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
