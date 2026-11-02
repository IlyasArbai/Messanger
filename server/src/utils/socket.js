import { Server } from "socket.io";
import { parseCookie } from "cookie";

import { getUserSession } from "#src/utils/redis.js";
import { MessageRepo } from "../message/repo.js";
import { ConversationRepo } from "../conversation/repo.js";

export let io;
const connectedUsers = [];

export const addSocket = (userId, socketId) => {
  let user = connectedUsers.find((u) => String(u.userId) === String(userId));

  if (!user) {
    user = { userId, sockets: [] };
    connectedUsers.push(user);
  }

  user.sockets.push({
    socketId,
    events: [],
  });
  return true;
};
export const subscribeEvent = (socketId, event) => {
  for (const user of connectedUsers) {
    const socket = user.sockets.find((s) => s.socketId === socketId);
    if (!socket) continue;
    if (!socket.events.includes(event)) socket.events.push(event);
    return true;
  }
  return false;
};
export const unsubscribeEvent = (socketId, event) => {
  for (const user of connectedUsers) {
    const socket = user.sockets.find((s) => s.socketId === socketId);
    if (!socket) continue;
    socket.events = socket.events.filter((e) => e !== event);
    return true;
  }
  return false;
};
export const removeSocket = (socketId) => {
  for (let i = connectedUsers.length - 1; i >= 0; i--) {
    const user = connectedUsers[i];
    user.sockets = user.sockets.filter((s) => s.socketId !== socketId);
    if (user.sockets.length === 0) connectedUsers.splice(i, 1);
  }
  return true;
};

export default connectedUsers;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_API,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication
  io.use(async (socket, next) => {
    try {
      const sid = parseCookie(socket.handshake.headers.cookie || "").sid;
      const user = sid ? await getUserSession(sid) : null;
      if (!user) return next(new Error("Unauthorized"));

      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user.id;
    addSocket(userId, socket.id);
    socket.join(`user:${userId}`);

    socket.onAny((event, ...args) => {
      console.log("📥 EVENT received :", event);
      console.log("📦 DATA:", ...args);
      console.log("🏠 ROOMS:", [...socket.rooms]);
    });
    socket.onAnyOutgoing((event, ...args) => {
      console.log("📥 EVENT received :", event);
      console.log("📦 DATA:", ...args);
      console.log("🏠 ROOMS:", [...socket.rooms]);
    });

    socket.on("conversation:join", async (conversationId, callback) => {
      try {
        conversationId = Number(conversationId);
        if (
          !(await ConversationRepo.find(
            {
              id: conversationId,
              members: { some: { userId } },
            },
            { id: true },
          ))
        )
          return res.json({
            success: false,
            message: "Conversation not found",
          });

        const event = `conversation:${conversationId}`;
        await socket.join(event);
        subscribeEvent(socket.id, event);
        console.log("cnv join");
        callback?.({ success: true });
      } catch (err) {
        callback?.({ success: false });
      }
    });
    socket.on("conversation:read", async (data, callback) => {
      try {
        if (
          !(await ConversationRepo.find(
            {
              id: data.conversationId,
              members: { some: { userId } },
            },
            { id: true },
          ))
        )
          return res.json({
            success: false,
            message: "Conversation not found",
          });

        const seenAt = new Date();
        await MessageRepo.updateMany(
          {
            conversationId: data.conversationId,
            senderId: { not: socket.data.user.id },
            seenAt: null,
          },
          {
            seenAt,
          },
        );
        socket.to(`conversation:${data.conversationId}`).emit("message:seen", {
          conversationId: data.conversationId,
          seenAt,
          seenBy: socket.data.user.username,
        });
        callback?.({ success: true });
      } catch (err) {
        callback?.({ success: false });
      }
    });
    socket.on("conversation:leave", async (conversationId, callback) => {
      try {
        conversationId = Number(conversationId);
        const event = `conversation:${conversationId}`;
        await socket.leave(event);
        unsubscribeEvent(socket.id, event);
        console.log("cnv leave");
        callback?.({ success: true });
      } catch (err) {
        log("LEAVE ERROR", {
          error: err.message,
          conversationId,
        });

        callback?.({ success: false });
      }
    });

    socket.on("disconnect", () => {
      removeSocket(socket.id);
    });
  });
}
