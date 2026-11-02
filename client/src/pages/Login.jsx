import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthProvider";
import api from "../utils/api";

export default function Login() {
  const { setUsername } = useAuth();

  const [username, setUsernameInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        username,
        password,
      });

      if (!data.success) {
        setError(data.message);
        return;
      }

      setUsername(data.username);
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-[90dvh] bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto flex h-full max-w-6xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
        {/* Left Panel */}
        <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-indigo-600 p-10 text-white lg:flex xl:p-14">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h8m-8 4h5m-9 6 2.5-4H18a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h.5L4 20Z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">
              Just Between Us.
            </span>
          </div>

          <div className="relative z-10 my-8">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-200">
              A space for two
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight xl:text-5xl">
              Some conversations
              <br />
              are just
              <br />
              <span className="text-indigo-200">between us.</span>
            </h1>

            <p className="mt-6 max-w-sm text-sm leading-7 text-indigo-100">
              A personal messaging experience designed exclusively for two
              people. Stay connected, share thoughts, and make every
              conversation count.
            </p>

            {/* Connection illustration */}
            <div className="mt-12 flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-bold">
                01
              </div>

              <div className="flex flex-1 items-center">
                <div className="h-px flex-1 bg-white/30" />
                <span className="mx-3 text-indigo-200">↔</span>
                <div className="h-px flex-1 bg-white/30" />
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-bold">
                02
              </div>
            </div>

            <div className="mt-3 flex justify-between text-xs text-indigo-200">
              <span>First person</span>
              <span>Second person</span>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/15 pt-6">
            <p className="text-xs text-indigo-200">
              Private by design. Personal by nature.
            </p>
          </div>
        </section>

        {/* Right Panel */}
        <section className="flex w-full flex-col justify-center px-6 py-8 sm:px-12 lg:w-1/2 xl:px-20">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h8m-8 4h5m-9 6 2.5-4H18a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h.5L4 20Z"
                  />
                </svg>
              </div>
              <span className="font-bold text-gray-900">Just Between Us.</span>
            </div>

            <div className="mb-9">
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
                Welcome back
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                Log in to your account
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                Enter your credentials to continue your conversations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-16 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-indigo-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log in →"}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Create account
              </Link>
            </p>

            <p className="mt-12 text-center text-xs text-gray-400">
              Designed & developed by{" "}
              <span className="font-semibold text-gray-600">Ilyas ARBAI</span> ·
              © 2026
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
