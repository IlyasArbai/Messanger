import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const checkUsername = async () => {
    const value = username.trim();

    if (!value) {
      setUsernameStatus("idle");
      return;
    }

    setCheckingUsername(true);
    setUsernameStatus("checking");

    try {
      const { data } = await api.post("/users/check-username", {
        username: value,
      });

      console.log(data);

      // Avoid applying a result to a username that has changed.
      if (value !== username.trim()) return;

      if (data.success && data.available) {
        setUsernameStatus("available");
      } else if (data.success) {
        setUsernameStatus("taken");
      } else {
        setUsernameStatus("error");
      }
    } catch (err) {
      console.error("Username check failed:", err);
      if (value === username.trim()) {
        setUsernameStatus("error");
      }
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (usernameStatus !== "available") {
      setError("Please choose an available username.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/register", {
        username: username.trim(),
        password,
      });

      if (!data.success) {
        setError(data.message || "Registration failed.");
        return;
      }

      setRegistered(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const usernameBorder = {
    idle: "border-gray-200 focus:border-indigo-500",
    checking: "border-yellow-400",
    available: "border-green-500 focus:ring-green-500/10",
    taken: "border-red-500 focus:ring-red-500/10",
    error: "border-red-500 focus:ring-red-500/10",
  };

  const statusMessage = {
    checking: "Checking username...",
    available: "✓ Username is available",
    taken: "✕ Username is already taken",
    error: "Unable to verify username. Try again.",
  };

  const statusColor = {
    checking: "text-yellow-600",
    available: "text-green-600",
    taken: "text-red-600",
    error: "text-red-600",
  };

  // Registration success
  if (registered) {
    return (
      <main className="h-[90dvh] bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto flex h-full max-w-6xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
          <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-indigo-600 p-12 text-white lg:flex xl:p-14">
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
            <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full border border-white/10" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <span className="text-xl">💬</span>
              </div>
              <span className="text-lg font-bold">Just Between Us.</span>
            </div>

            <div className="relative z-10">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-200">
                Your space awaits
              </span>
              <h1 className="mt-6 text-5xl font-bold leading-tight">
                Every great
                <br />
                conversation
                <br />
                starts somewhere.
              </h1>
              <p className="mt-6 max-w-sm text-sm leading-7 text-indigo-100">
                Your personal space is ready. Sign in and start connecting with
                the other person.
              </p>
            </div>

            <p className="relative z-10 border-t border-white/15 pt-6 text-xs text-indigo-200">
              Two people. One private space.
            </p>
          </section>

          <section className="flex w-full flex-col items-center justify-center px-6 py-8 text-center lg:w-1/2 sm:px-12">
            <div className="mx-auto w-full max-w-md">
              <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-4xl text-green-600 ring-8 ring-green-50/50">
                ✓
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">
                Registration complete
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                You're all set!
              </h1>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                Your account has been created successfully. You can now log in
                using your username and password and start your conversations.
              </p>

              <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs text-gray-400">Your username</p>
                <p className="mt-1 font-semibold text-gray-900">{username}</p>
              </div>

              <Link
                to="/login"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.98]"
              >
                Continue to login →
              </Link>

              <p className="mt-12 text-xs text-gray-400">
                Designed & developed by{" "}
                <span className="font-semibold text-gray-600">Ilyas ARBAI</span>{" "}
                · © 2026
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[90dvh] bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto flex h-full max-w-6xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
        {/* Left Panel */}
        <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-indigo-600 p-8 text-white lg:flex">
          {/* Background decorations */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-10 right-10 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />

          {/* Brand */}
          <div className="relative z-10 flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
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

          {/* Main Content */}
          <div className="relative z-10 my-auto py-6">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-200">
              Your connection starts here
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight xl:text-5xl">
              Two people.
              <br />
              One space.
              <br />
              <span className="text-indigo-200">Endless conversations.</span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-6 text-indigo-100">
              Create your account and become part of a personal messaging
              experience built exclusively for two people.
            </p>

            {/* Compact Features */}
            <div className="mt-8 space-y-4">
              {[
                ["01", "A personal space", "Just two accounts, no crowds."],
                ["02", "Stay connected", "Exchange messages in real time."],
                [
                  "03",
                  "Keep it simple",
                  "Everything focused on conversations.",
                ],
              ].map(([number, title, description]) => (
                <div key={number} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-xs font-bold">
                    {number}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="mt-0.5 text-xs text-indigo-200">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 shrink-0 border-t border-white/15 pt-4">
            <p className="text-xs text-indigo-200">
              Private by design. Personal by nature.
            </p>
          </div>
        </section>

        {/* Right Panel */}
        <section className="flex w-full flex-col justify-center overflow-y-auto px-6 py-6 sm:px-12 lg:w-1/2 xl:px-20">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Brand */}
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <span className="text-xl">💬</span>
              </div>
              <span className="font-bold text-gray-900">Just Between Us.</span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
                Create your account
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                Join the conversation.
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Set up your account to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Username
                </label>

                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setUsernameStatus("idle");
                      setError("");
                    }}
                    onBlur={checkUsername}
                    placeholder="Choose a username"
                    autoComplete="username"
                    required
                    className={`w-full rounded-xl border bg-gray-50 px-4 py-3.5 pr-12 text-sm outline-none transition focus:bg-white focus:ring-4 focus:ring-indigo-500/10 ${usernameBorder[usernameStatus]}`}
                  />

                  {usernameStatus === "available" && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600">
                      ✓
                    </span>
                  )}

                  {usernameStatus === "taken" && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                      ✕
                    </span>
                  )}
                </div>

                {statusMessage[usernameStatus] && (
                  <p className={`mt-2 text-xs ${statusColor[usernameStatus]}`}>
                    {statusMessage[usernameStatus]}
                  </p>
                )}

                {usernameStatus === "idle" && (
                  <p className="mt-2 text-xs text-gray-400">
                    Choose a unique username for your account.
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-16 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-indigo-600"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-2 text-xs text-red-500">
                    Passwords do not match.
                  </p>
                )}

                {confirmPassword && password === confirmPassword && (
                  <p className="mt-2 text-xs text-green-600">
                    ✓ Passwords match
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  loading ||
                  checkingUsername ||
                  usernameStatus !== "available" ||
                  !password ||
                  !confirmPassword ||
                  password !== confirmPassword
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account →"}
              </button>
            </form>

            {/* Login Link */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Log in
              </Link>
            </p>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-gray-400">
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
