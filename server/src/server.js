import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import cors from "cors";

import AuthRoutes from "./auth/routes.js";
import UserRoutes from "./user/routes.js";
import ConversationRoutes from "./conversation/routes.js";
import MessagesRoutes from "./message/routes.js";
import RequestsRoutes from "./friend-requests/routes.js";

import { connectRedis, rateLimiter } from "./utils/redis.js";
import { initSocket } from "./utils/socket.js";

const app = express();
const httpServer = createServer(app);

app.set("trust proxy", false);

app.use(
  cors({
    origin: process.env.CLIENT_API,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", rateLimiter);

app.use("/auth", AuthRoutes);
app.use("/users", UserRoutes);
app.use("/conversations", ConversationRoutes);
app.use("/messages", MessagesRoutes);
app.use("/requests", RequestsRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.get("/ip", (req, res) => {
  res.json({
    ip: req.ip,
    ips: req.ips,
    socketIp: req.socket.remoteAddress,
  });
});

await connectRedis();
initSocket(httpServer);

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
