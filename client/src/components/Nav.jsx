import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../utils/AuthProvider.jsx";
import api from "../utils/api.js";

export default function Navbar() {
  const { username, setUsername } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    try {
      const { data } = await api.post("/auth/logout");

      if (data.success) {
        setUsername(null);
        setMenuOpen(false);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:h-20 md:px-12 xl:px-20">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex shrink-0 items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <span className="text-lg font-bold">J</span>
            </div>

            <span className="text-base font-bold tracking-tight text-gray-900 sm:text-lg">
              Just Between <span className="text-indigo-600">Us.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={linkClass}>
              Home
            </NavLink>

            {username && (
              <>
                <NavLink to="/conversations" className={linkClass}>
                  Conversations
                </NavLink>

                <NavLink to="/requests" className={linkClass}>
                  Requests
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* Desktop Authentication */}
        <div className="hidden items-center gap-3 md:flex">
          {username ? (
            <>
              <span className="text-sm text-gray-500">Hi, {username}</span>

              <button
                onClick={logout}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Login
              </NavLink>

              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 md:hidden"
        >
          {menuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink
              to="/"
              end
              className={mobileLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>

            {username && (
              <>
                <NavLink
                  to="/conversations"
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Conversations
                </NavLink>

                <NavLink
                  to="/requests"
                  className={mobileLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Requests
                </NavLink>
              </>
            )}
          </div>

          <div className="my-3 border-t border-gray-100" />

          {username ? (
            <div className="flex flex-col gap-3">
              <p className="px-4 text-sm text-gray-500">
                Hi,{" "}
                <span className="font-semibold text-gray-900">{username}</span>
              </p>

              <button
                onClick={logout}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <NavLink
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Login
              </NavLink>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
