export default function Home() {
  return (
    <main className="h-[90dvh] bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto flex h-full max-w-5xl flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h8m-8 4h5m-9 6 2.5-4H18a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h.5L4 20Z"
                />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-gray-900">
              Just Between Us<span className="text-indigo-600">.</span>
            </span>
          </div>

          <span className="rounded-full border border-green-100 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
            Private by design
          </span>
        </header>

        {/* Main content */}
        <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
            A messaging experience for two
          </p>

          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-6xl">
            Some conversations
            <br />
            <span className="text-indigo-600">are just between us.</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
            A personal messaging platform built exclusively for two people.
            Share thoughts, exchange messages, and stay connected through a
            simple, focused communication experience.
          </p>

          {/* Connection visualization */}
          <div className="mt-10 flex w-full max-w-md items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-600 ring-8 ring-indigo-50">
                01
              </div>
              <span className="text-xs font-semibold text-gray-700">
                First person
              </span>
            </div>

            <div className="relative mx-5 mb-5 flex flex-1 items-center">
              <div className="h-px w-full bg-indigo-200" />
              <div className="absolute left-1/2 -translate-x-1/2 rounded-full border border-indigo-100 bg-white p-2 text-indigo-600">
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
                    d="M8 12h8m-4-4 4 4-4 4"
                  />
                </svg>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-xl font-bold text-purple-600 ring-8 ring-purple-50">
                02
              </div>
              <span className="text-xs font-semibold text-gray-700">
                Second person
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {[
              ["01", "Private conversations"],
              ["02", "Real-time messaging"],
              ["03", "Simple & personal"],
            ].map(([number, label]) => (
              <div key={number} className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-500">
                  {number}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-2 border-t border-gray-100 px-6 py-5 sm:flex-row sm:px-10">
          <p className="text-xs text-gray-400">
            A small space for meaningful conversations.
          </p>
          <p className="text-xs text-gray-500">
            Designed & developed by{" "}
            <span className="font-semibold text-gray-900">Ilyas ARBAI</span>
            <span className="mx-2 text-gray-300">·</span>© 2026
          </p>
        </footer>
      </div>
    </main>
  );
}
