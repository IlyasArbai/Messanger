import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../utils/api";
import { useAuth } from "../utils/AuthProvider";

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [filter, setFilter] = useState("RECEIVED");

  // User search
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState({});
  const [searchError, setSearchError] = useState(null);

  const { username } = useAuth();

  // Fetch requests
  const getRequests = useCallback(async () => {
    try {
      setError(null);

      const { data } = await api.get("/requests");
      const requestsData = Array.isArray(data) ? data : data.requests;

      if (!Array.isArray(requestsData))
        throw new Error("Invalid requests API response");

      setRequests((prev) => {
        const merged = [...requestsData];

        prev.forEach((request) => {
          if (!merged.some((item) => item.id === request.id)) {
            merged.push(request);
          }
        });

        return merged.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      });
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load requests.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getRequests();

    const handleNewRequest = (event) => {
      const newRequest = event.detail;

      setRequests((prev) => {
        if (prev.some((item) => item.id === newRequest.id)) return prev;
        return [newRequest, ...prev];
      });
    };

    const handleUpdateRequest = (event) => {
      const newRequest = event.detail;
      console.log("event update");
      console.log(event);
      console.log(event.detail);

      setRequests((prev) => {
        return prev.map((item) =>
          item.id === newRequest.id ? { ...item, ...newRequest } : item,
        );
      });

      console.log(requests);
    };

    window.addEventListener("request:new", handleNewRequest);
    window.addEventListener("request:update", handleUpdateRequest);

    return () => {
      window.removeEventListener("request:new", handleNewRequest);
      window.removeEventListener("request:update", handleUpdateRequest);
    };
  }, [getRequests]);

  // Search users
  useEffect(() => {
    const query = search.trim();

    if (!query) {
      setSearchResults([]);
      setSearchError(null);
      setSearching(false);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        setSearching(true);
        setSearchError(null);

        const { data } = await api.get(
          `/users/search?q=${encodeURIComponent(query)}`,
        );

        if (!cancelled) {
          const users = Array.isArray(data) ? data : data.users || [];

          setSearchResults(
            users.filter(
              (user) =>
                user.username?.toLowerCase() !== username?.toLowerCase(),
            ),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setSearchError(
            err.response?.data?.message || "Failed to search users.",
          );
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, username]);

  const sendRequest = async (selectedUsername) => {
    if (!selectedUsername || sending[selectedUsername]) return;

    try {
      setSending((prev) => ({
        ...prev,
        [selectedUsername]: true,
      }));

      const { data } = await api.post("/requests", {
        username: selectedUsername,
      });

      const newRequest = data.request || data;

      if (data.success && newRequest.id) {
        setRequests((prev) => {
          if (prev.some((item) => item.id === newRequest.id)) return prev;

          return [newRequest, ...prev];
        });
      }

      setSearchResults((prev) =>
        prev.filter((user) => user.username !== selectedUsername),
      );
    } catch (err) {
      console.error("Failed to send request:", err);
      alert(err.response?.data?.message || "Failed to send friend request.");
    } finally {
      setSending((prev) => ({
        ...prev,
        [selectedUsername]: false,
      }));
    }
  };

  // Separate sent and received requests
  const receivedRequests = useMemo(
    () => requests.filter((r) => r.receiver?.username === username),
    [requests, username],
  );

  const sentRequests = useMemo(
    () => requests.filter((r) => r.sender?.username === username),
    [requests, username],
  );

  // Apply selected filter
  const filteredRequests = useMemo(() => {
    switch (filter) {
      case "SENT":
        return sentRequests;
      case "RECEIVED":
        return receivedRequests;
      default:
        return requests.filter(
          (r) =>
            r.sender?.username === username ||
            r.receiver?.username === username,
        );
    }
  }, [filter, requests, sentRequests, receivedRequests, username]);

  // Accept / reject request
  const updateRequest = async (requestId, status) => {
    const request = requests.find((item) => item.id === requestId);

    if (
      !request ||
      request.status !== "PENDING" ||
      request.receiver?.username !== username
    ) {
      return;
    }

    try {
      setUpdating((prev) => ({
        ...prev,
        [requestId]: true,
      }));

      setRequests((prev) =>
        prev.map((item) =>
          item.id === requestId ? { ...item, status } : item,
        ),
      );

      await api.patch(`/requests/${requestId}`, { status });
    } catch (err) {
      console.error("Failed to update request:", err);

      setRequests((prev) =>
        prev.map((item) =>
          item.id === requestId ? { ...item, status: request.status } : item,
        ),
      );

      alert(err.response?.data?.message || "Failed to update friend request.");
    } finally {
      setUpdating((prev) => ({
        ...prev,
        [requestId]: false,
      }));
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      case "ACCEPTED":
        return "bg-green-50 text-green-700 ring-green-600/20";
      case "REJECTED":
        return "bg-red-50 text-red-700 ring-red-600/20";
      default:
        return "bg-gray-50 text-gray-600 ring-gray-500/20";
    }
  };

  const filters = [
    { id: "RECEIVED", label: "Received", count: receivedRequests.length },
    { id: "SENT", label: "Sent", count: sentRequests.length },
    {
      id: "ALL",
      label: "All",
      count: receivedRequests.length + sentRequests.length,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 text-center bg-red-50 rounded-xl">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={getRequests}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Friend Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your connections.</p>
        </div>

        <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl">
          <span className="text-xl font-bold">
            {receivedRequests.filter((r) => r.status === "PENDING").length}
          </span>
          <span className="text-sm ml-2">Pending requests</span>
        </div>
      </div>

      {/* Search and send friend requests */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-7 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Add a friend
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Search for someone by their username.
        </p>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <path d="m16 16 4 4" strokeWidth="2" />
            </svg>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username..."
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

          {search && (
            <button
              onClick={() => {
                setSearch("");
                setSearchResults([]);
              }}
              className="absolute inset-y-0 right-3 text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search results */}
        {search.trim() && (
          <div className="mt-3">
            {searching ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-200 border-t-blue-600" />
              </div>
            ) : searchError ? (
              <p className="text-sm text-red-500 py-4">{searchError}</p>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {searchResults.map((user) => {
                  const isSending = sending[user.username];

                  return (
                    <div
                      key={user.username}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                          {user.username?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.username}
                          </p>

                          {user.name && (
                            <p className="text-sm text-gray-500 truncate">
                              {user.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => sendRequest(user.username)}
                        disabled={isSending}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                      >
                        {isSending ? "Sending..." : "Add friend"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-5">
                No users found.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-6 w-full sm:w-fit">
        {filters.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              filter === item.id
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {item.label}

            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                filter === item.id
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Requests */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-3">👥</div>

          <h2 className="text-lg font-semibold text-gray-800">
            {filter === "RECEIVED"
              ? "No received requests"
              : filter === "SENT"
                ? "No sent requests"
                : "No requests yet"}
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            {filter === "RECEIVED"
              ? "When someone sends you a friend request, it will appear here."
              : filter === "SENT"
                ? "Friend requests you send will appear here."
                : "Your friend requests will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => {
            const isReceiver = request.receiver?.username === username;
            const canRespond = isReceiver && request.status === "PENDING";
            const isUpdating = updating[request.id];

            const displayedUser = isReceiver
              ? request.sender
              : request.receiver;

            return (
              <div
                key={request.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* User information */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold shrink-0">
                      {displayedUser?.username?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {displayedUser?.username || "Unknown user"}
                      </h2>

                      <p className="text-sm text-gray-500 mt-0.5">
                        {isReceiver
                          ? "Sent you a friend request"
                          : "You sent a friend request"}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Request #{request.id}
                      </p>
                    </div>
                  </div>

                  {/* Status and actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {request.status !== "PENDING" && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${getStatusStyle(
                          request.status,
                        )}`}
                      >
                        {request.status}
                      </span>
                    )}

                    {canRespond && (
                      <div className="flex gap-2">
                        <button
                          disabled={isUpdating}
                          onClick={() => updateRequest(request.id, "ACCEPTED")}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          Accept
                        </button>

                        <button
                          disabled={isUpdating}
                          onClick={() => updateRequest(request.id, "REJECTED")}
                          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
