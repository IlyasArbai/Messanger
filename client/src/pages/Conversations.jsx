import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import api from "../utils/api.js";
import { useAuth } from "../utils/AuthProvider";
import { useSocket } from "../utils/SocketProvider";

const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const normalizeMessage = (m) => ({
  ...m,
  content: m.content ?? null,
  isEdited: Boolean(m.isEdited),
  isDeleted: Boolean(m.isDeleted),
  seenAt: m.seenAt ?? null,
});

export default function Conversations() {
  const { username } = useAuth();
  const { socket, connected } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [updatingMessage, setUpdatingMessage] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState(null);

  const [error, setError] = useState("");

  const requestId = useRef(0);
  const messagesEndRef = useRef(null);
  const joinedRoomRef = useRef(null);
  const selectedIdRef = useRef(null);
  const usernameRef = useRef(username);
  const peerUsernameRef = useRef(null);

  const selectedConversation = conversations.find(
    (c) => String(c.id) === String(selectedId),
  );

  // Keep refs current so socket handlers never read stale state.
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    usernameRef.current = username;
  }, [username]);

  useEffect(() => {
    peerUsernameRef.current = selectedConversation?.username ?? null;
  }, [selectedConversation]);

  // Shared helpers — reused by socket listeners and API handlers.
  const updateMessageLocally = useCallback((messageId, updates) => {
    setMessages((cur) =>
      cur.map((m) =>
        String(m.id) === String(messageId)
          ? normalizeMessage({ ...m, ...updates })
          : m,
      ),
    );
  }, []);

  const deleteMessageLocally = useCallback((messageId) => {
    setMessages((cur) =>
      cur.map((m) =>
        String(m.id) === String(messageId)
          ? { ...m, content: null, isDeleted: true }
          : m,
      ),
    );
    setEditingMessageId((current) =>
      String(current) === String(messageId) ? null : current,
    );
  }, []);

  // Load conversations on mount.
  useEffect(() => {
    let active = true;

    api
      .get("/conversations")
      .then(({ data }) => {
        if (!active) return;
        setConversations(
          data.conversations.map((c) => ({
            ...c,
            hasUnread: Boolean(c.hasUnread || c.unreadCount > 0),
          })),
        );
      })
      .catch((err) => {
        console.error("Failed to load conversations:", err);
        if (active) setError("Failed to load conversations.");
      })
      .finally(() => active && setLoadingConversations(false));

    return () => {
      active = false;
    };
  }, []);

  // Socket listeners — registered once per socket connection.
  useEffect(() => {
    if (!socket) return;

    const isCurrentConversation = (cid) =>
      String(cid) === String(selectedIdRef.current);

    const handleNewMessage = (payload) => {
      if (isCurrentConversation(payload.conversationId)) {
        setMessages((cur) =>
          cur.some((m) => String(m.id) === String(payload.id))
            ? cur
            : [...cur, normalizeMessage(payload)],
        );
        socket.emit("conversation:read", {
          conversationId: payload.conversationId,
          seenBy: usernameRef.current,
        });
      } else {
        setConversations((cur) =>
          cur.map((c) =>
            String(c.id) === String(payload.conversationId)
              ? { ...c, hasUnread: true }
              : c,
          ),
        );
      }
    };

    const handleSeen = ({ seenAt, seenBy }) => {
      if (seenBy && seenBy !== peerUsernameRef.current) return;
      setMessages((cur) =>
        cur.map((m) =>
          m.sender === usernameRef.current && m.seenAt == null
            ? { ...m, seenAt: seenAt || new Date().toISOString() }
            : m,
        ),
      );
    };

    const handleEdited = ({
      conversationId,
      messageId,
      content,
      message: upd,
    }) => {
      if (!isCurrentConversation(conversationId)) return;
      updateMessageLocally(messageId, {
        ...(upd || {}),
        ...(content !== undefined ? { content } : {}),
        isEdited: true,
      });
    };

    const handleDeleted = ({ conversationId, messageId }) => {
      if (!isCurrentConversation(conversationId)) return;
      deleteMessageLocally(messageId);
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:seen", handleSeen);
    socket.on("message:edited", handleEdited);
    socket.on("message:deleted", handleDeleted);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:seen", handleSeen);
      socket.off("message:edited", handleEdited);
      socket.off("message:deleted", handleDeleted);
    };
  }, [socket, updateMessageLocally, deleteMessageLocally]);

  // Rejoin the active room after a (re)connect.
  useEffect(() => {
    if (!socket || !connected) return;
    const id = selectedIdRef.current;
    if (!id) return;
    socket.emit("conversation:join", id);
    joinedRoomRef.current = String(id);
  }, [socket, connected]);

  // Leave the room on unmount / navigation away.
  useEffect(() => {
    return () => {
      if (socket && joinedRoomRef.current) {
        socket.emit("conversation:leave", joinedRoomRef.current);
        joinedRoomRef.current = null;
      }
    };
  }, [socket]);

  // Select a conversation.
  const selectConversation = async (id) => {
    const req = ++requestId.current;

    // Leave the previous room before switching.
    if (socket && joinedRoomRef.current) {
      socket.emit("conversation:leave", joinedRoomRef.current);
      joinedRoomRef.current = null;
    }

    setSelectedId(id);
    setMessages([]);
    setError("");
    setEditingMessageId(null);
    setEditingContent("");
    setLoadingMessages(true);

    setConversations((cur) =>
      cur.map((c) =>
        String(c.id) === String(id) ? { ...c, hasUnread: false } : c,
      ),
    );

    try {
      const { data } = await api.get(`/conversations/${id}`);
      if (!data.success) throw new Error("Failed to load conversation");
      if (req !== requestId.current) return;

      setMessages(data.conversation.messages.map(normalizeMessage));

      if (socket && connected) {
        socket.emit("conversation:join", id);
        joinedRoomRef.current = String(id);
        socket.emit("conversation:read", { conversationId: id });
      }
    } catch (err) {
      if (req === requestId.current) {
        console.error("Failed to load conversation:", err);
        setError("Failed to load messages.");
      }
    } finally {
      if (req === requestId.current) {
        setLoadingMessages(false);
      }
    }
  };

  // Send a message.
  const sendMessage = async (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || !selectedId || sending) return;

    setSending(true);
    setError("");

    try {
      const { data } = await api.post("/messages", {
        conversationId: selectedId,
        content: text,
      });
      if (!data.success) throw new Error("Failed to send message");

      const newMessage = normalizeMessage({
        ...data.message,
        sender: username,
      });

      setMessages((cur) =>
        cur.some((m) => String(m.id) === String(newMessage.id))
          ? cur
          : [...cur, newMessage],
      );
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Editing.
  const startEditing = (msg) => {
    if (msg.sender !== username || msg.isDeleted) return;
    setError("");
    setEditingMessageId(msg.id);
    setEditingContent(msg.content || "");
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  const saveEdit = async (messageId) => {
    const content = editingContent.trim();
    if (!content || updatingMessage) return;

    setUpdatingMessage(true);
    setError("");

    try {
      const { data } = await api.patch(`/messages/${messageId}`, { content });
      if (!data.success) throw new Error("Failed to edit message");

      updateMessageLocally(messageId, {
        ...(data.message || {}),
        content,
        isEdited: true,
      });
      cancelEditing();
    } catch (err) {
      console.error("Failed to edit message:", err);
      setError("Failed to edit message. Please try again.");
    } finally {
      setUpdatingMessage(false);
    }
  };

  // Delete (soft).
  const deleteMessage = async (messageId) => {
    if (deletingMessageId !== null) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );
    if (!confirmed) return;

    setDeletingMessageId(messageId);
    setError("");

    try {
      const { data } = await api.delete(`/messages/${messageId}`);
      if (!data.success) throw new Error("Failed to delete message");
      deleteMessageLocally(messageId);
    } catch (err) {
      console.error("Failed to delete message:", err);
      setError("Failed to delete message. Please try again.");
    } finally {
      setDeletingMessageId(null);
    }
  };

  // Auto-scroll to newest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close conversation and leave its room.
  const closeConversation = () => {
    requestId.current++;

    if (socket && joinedRoomRef.current) {
      socket.emit("conversation:leave", joinedRoomRef.current);
      joinedRoomRef.current = null;
    }

    setSelectedId(null);
    setMessages([]);
    setError("");
    setLoadingMessages(false);
    setEditingMessageId(null);
    setEditingContent("");
  };

  return (
    <div className="mx-auto flex h-[90dvh] w-full max-w-7xl flex-col px-4 py-5 md:px-8">
      <div className="mb-5 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Conversations
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Your private space to talk.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* SIDEBAR */}
        <aside
          className={`${
            selectedId ? "hidden md:flex" : "flex"
          } w-full shrink-0 flex-col border-r border-gray-200 md:w-80 lg:w-96`}
        >
          <div className="shrink-0 border-b border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900">Messages</h2>

            <p className="mt-1 text-xs text-gray-500">
              {conversations.length} conversation
              {conversations.length !== 1 && "s"}
            </p>
          </div>

          {loadingConversations ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          ) : conversations.length > 0 ? (
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c.id)}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                    String(selectedId) === String(c.id)
                      ? "bg-indigo-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold text-indigo-700">
                    {c.username?.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {c.username}
                    </p>
                  </div>

                  {c.hasUnread && (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <svg
                  className="h-8 w-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h8M8 14h5m-9 6 2.5-4H17a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v14Z"
                  />
                </svg>
              </div>

              <h3 className="font-semibold text-gray-900">
                No conversations yet
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Your conversations will appear here when someone accepts your
                friend request.
              </p>

              <Link
                to="/requests"
                className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Send friend requests
              </Link>
            </div>
          )}
        </aside>

        {/* CHAT PANEL */}
        <main
          className={`${
            selectedId ? "flex" : "hidden md:flex"
          } min-w-0 flex-1 flex-col bg-white`}
        >
          {selectedConversation ? (
            <>
              {/* CHAT HEADER */}
              <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 px-4 py-4 md:px-6">
                <button
                  onClick={closeConversation}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
                  aria-label="Back to conversations"
                >
                  ←
                </button>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                  {selectedConversation.username?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {selectedConversation.username}
                  </h2>

                  <p className="text-xs text-gray-500">Conversation</p>
                </div>
              </div>

              {/* MESSAGES */}
              <div className="flex-1 space-y-5 overflow-y-auto bg-gray-50/50 p-4 md:p-6">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-gray-400">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender === username;

                    const isEditing =
                      String(editingMessageId) === String(msg.id);

                    const isDeleting =
                      String(deletingMessageId) === String(msg.id);

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div className="max-w-[80%] md:max-w-[65%]">
                          {isEditing ? (
                            <div className="min-w-[240px] rounded-2xl border border-indigo-200 bg-white p-3 shadow-sm">
                              <textarea
                                value={editingContent}
                                onChange={(e) =>
                                  setEditingContent(e.target.value)
                                }
                                rows={3}
                                autoFocus
                                disabled={updatingMessage}
                                className="w-full resize-none rounded-lg border border-gray-200 p-2 text-sm text-gray-800 outline-none focus:border-indigo-400"
                              />

                              <div className="mt-2 flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  disabled={updatingMessage}
                                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() => saveEdit(msg.id)}
                                  disabled={
                                    !editingContent.trim() || updatingMessage
                                  }
                                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {updatingMessage ? "Saving..." : "Save"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                isMine
                                  ? "rounded-br-md bg-indigo-600 text-white"
                                  : "rounded-bl-md border border-gray-200 bg-white text-gray-700"
                              } ${msg.isDeleted ? "italic opacity-70" : ""}`}
                            >
                              {msg.isDeleted
                                ? "This message was deleted"
                                : msg.content}
                            </div>
                          )}

                          <div
                            className={`mt-1 flex items-center gap-2 text-[11px] text-gray-400 ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span>{formatTime(msg.createdAt)}</span>

                            {msg.isEdited && !msg.isDeleted && (
                              <span>Edited</span>
                            )}

                            {isMine && !msg.isDeleted && msg.seenAt && (
                              <span className="font-medium text-indigo-500">
                                Seen
                              </span>
                            )}
                          </div>

                          {isMine && !msg.isDeleted && !isEditing && (
                            <div className="mt-1 flex justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => startEditing(msg)}
                                disabled={
                                  updatingMessage || deletingMessageId !== null
                                }
                                className="text-xs font-medium text-gray-400 transition hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteMessage(msg.id)}
                                disabled={
                                  deletingMessageId !== null || updatingMessage
                                }
                                className="text-xs font-medium text-gray-400 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isDeleting ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              {error && (
                <div className="shrink-0 px-4 pt-2 text-xs text-red-500 md:px-6">
                  {error}
                </div>
              )}

              {/* SEND MESSAGE */}
              <form
                onSubmit={sendMessage}
                className="shrink-0 border-t border-gray-100 bg-white p-4 md:px-6"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Message ${selectedConversation.username}...`}
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />

                  <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Send"}

                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
                <svg
                  className="h-10 w-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h8M8 14h5m-9 6 2.5-4H17a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v14Z"
                  />
                </svg>
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                Your conversations, all in one place
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Select a conversation from the list to start messaging. This
                space is just between you and your friends.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
