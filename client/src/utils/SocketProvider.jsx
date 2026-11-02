import { createContext, useContext, useEffect, useRef, useState } from "react";

import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const SocketContext = createContext(null);

const NOTIFICATION_DELAY = 500;

export function SocketProvider({ children }) {
  const { username, loading } = useAuth();
  const location = useLocation();

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  const timers = useRef(new Map());

  // Check whether the Requests page is active and visible
  const isRequestsPage = location.pathname.startsWith("/requests");

  // Clear pending notification timers
  const clearTimers = () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
  };

  // Socket connection
  useEffect(() => {
    if (loading || !username) {
      setConnected(false);
      setSocket(null);
      return;
    }

    const newSocket = io(window.location.origin, {
      path: "/socket.io/",
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("🟢 Socket connected:", newSocket.id);
      setConnected(true);
    });

    newSocket.on("message:new", (payload) => {
      console.log("provider : ", payload);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setConnected(false);
      clearTimers();
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
    });

    // Log all incoming events
    newSocket.onAny((event, ...args) => {
      console.log("📥 EVENT:", event);
      console.log("📦 DATA:", ...args);

      args.forEach((arg) => {
        if (arg?.room || arg?.rooms) {
          console.log("🏠 ROOM:", arg.room || arg.rooms);
        }
      });
    });

    newSocket.connect();
    setSocket(newSocket);

    return () => {
      clearTimers();
      newSocket.disconnect();
      newSocket.removeAllListeners();

      setSocket(null);
      setConnected(false);
    };
  }, [username, loading]);

  // Handle new requests
  useEffect(() => {
    if (!socket) return;

    const handleNewRequest = (request) => {
      const requestId = request.id;

      if (isRequestsPage) {
        window.dispatchEvent(
          new CustomEvent("request:new", {
            detail: request,
          }),
        );

        return;
      }

      // Prevent duplicate notifications
      if (timers.current.has(requestId)) return;

      // Delay notification
      const timer = setTimeout(() => {
        toast.info("You have received a new request!", {
          toastId: `request-${requestId}`,
        });

        timers.current.delete(requestId);
      }, NOTIFICATION_DELAY);
      timers.current.set(requestId, timer);
    };

    const handleUpdateRequest = (request) => {
      const requestId = request.id;

      if (isRequestsPage) {
        window.dispatchEvent(
          new CustomEvent("request:update", {
            detail: request,
          }),
        );

        return;
      }

      if (timers.current.has(requestId)) return;

      const timer = setTimeout(() => {
        toast.info("A request updated!", {
          toastId: `request-${requestId}`,
        });

        timers.current.delete(requestId);
      }, NOTIFICATION_DELAY);
      timers.current.set(requestId, timer);
    };

    socket.on("request:new", handleNewRequest);
    socket.on("request:update", handleUpdateRequest);

    return () => {
      socket.off("request:new", handleNewRequest);
      socket.off("request:update", handleUpdateRequest);
    };
  }, [socket, isRequestsPage]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be inside SocketProvider");
  return context;
}
