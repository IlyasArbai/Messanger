import { UserRepo } from "../user/repo.js";
import { FriendRequestRepo } from "./repo.js";
import { ConversationRepo } from "#src/conversation/repo.js";
import { io } from "../utils/socket.js";

export class FriendRequestController {
  static async index(req, res) {
    try {
      const requests = await FriendRequestRepo.all({
        where: {
          OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
        },
        select: {
          id: true,
          status: true,
          sender: {
            select: {
              username: true,
            },
          },
          receiver: {
            select: {
              username: true,
            },
          },
          createdAt: true,
        },
      });

      return res.json({ success: true, requests });
    } catch (err) {
      console.error(err);
      return res.json({
        success: false,
        message: "Failed to get friend requests",
      });
    }
  }

  static async store(req, res) {
    try {
      const receiver = await UserRepo.find(
        { username: req.validated.body.username },
        { id: true },
      );

      if (!receiver || receiver.id === req.user.id)
        return res.json({
          success: false,
          message: "Request cant be sent",
        });

      const requests = await FriendRequestRepo.all({
        where: {
          OR: [
            { senderId: req.user.id, receiverId: receiver.id },
            { senderId: receiver.id, receiverId: req.user.id },
          ],
        },
        select: {
          id: true,
          senderId: true,
          receiverId: true,
          status: true,
        },
      });

      const outgoing = requests.find((r) => r.senderId === req.user.id);
      const incoming = requests.find((r) => r.senderId === receiver.id);

      if (outgoing?.status === "PENDING")
        return res.json({
          success: false,
          message: "Request already sent",
        });
      if (incoming?.status === "PENDING")
        return res.json({
          success: true,
          message: "This person already sent you a request. Accept it instead.",
          request: { id: incoming.id, username: req.validated.body.username },
        });
      if (outgoing?.status === "ACCEPTED" || incoming?.status === "ACCEPTED")
        return res.json({
          success: false,
          message: "You are already friends",
        });
      if (outgoing?.status === "REJECTED")
        return res.json({
          success: true,
          message: "Friend request was refused and cant be sent again",
        });

      const request = await FriendRequestRepo.create(
        {
          senderId: req.user.id,
          receiverId: receiver.id,
        },
        {
          id: true,
          status: true,
          sender: {
            select: {
              username: true,
            },
          },
          receiver: {
            select: {
              username: true,
            },
          },
          createdAt: true,
        },
      );

      io.to(`user:${receiver.id}`).emit("request:new", request);

      return res.json({
        success: true,
        message: "Friend request sent successfully",
        request,
      });
    } catch (err) {
      console.error(err);

      return res.json({
        success: false,
        message: "Problem creating request",
      });
    }
  }

  static async edit(req, res) {
    try {
      const request = await FriendRequestRepo.find(
        {
          id: req.validated.params.id,
        },
        {
          id: true,
          receiverId: true,
          receiver: { select: { id: true } },
          status: true,
        },
      );

      if (
        !request ||
        request.receiverId != req.user.id ||
        request.status !== "PENDING"
      )
        return res.json({
          success: false,
          message: "You can't update this request",
        });

      const updatedRequest = await FriendRequestRepo.update(
        request.id,
        {
          status: req.validated.body.status,
        },
        {
          id: true,
          status: true,
          senderId: true,
          receiverId: true,
          sender: {
            select: {
              username: true,
            },
          },
          receiver: {
            select: {
              username: true,
            },
          },
          createdAt: true,
        },
      );

      if (req.validated.body.status === "ACCEPTED")
        await ConversationRepo.create({
          members: {
            create: [
              { userId: updatedRequest.senderId },
              { userId: updatedRequest.receiverId },
            ],
          },
        });

      const send = {
        id: updatedRequest.id,
        sender: { username: updatedRequest.sender.username },
        receiver: { username: updatedRequest.receiver.username },
        status: updatedRequest.status,
        createdAt: updatedRequest.createdAt,
      };

      io.to(`user:${updatedRequest.senderId}`).emit("request:updated", send);
      console.log("yes7");

      return res.json({
        success: true,
        message: "Request updated successfully",
        send,
      });
    } catch (err) {
      console.error(err.message);
      return res.json({
        success: false,
        message: "Problem updating request",
      });
    }
  }

  static async destroy(req, res) {
    try {
      const request = await FriendRequestRepo.find({
        id: req.validated.params.id,
      });

      if (!request)
        return res.json({
          success: false,
          message: "Request not found",
        });
      if (request.senderId !== req.user.id || request.status !== "PENDING")
        return res.json({
          success: false,
          message: "You can't delete this request",
        });

      await FriendRequestRepo.delete(request.id);
      return res.json({
        success: true,
        message: "Request deleted successfully",
      });
    } catch (err) {
      console.error(err.message);
      return res.json({
        success: false,
        message: "Problem deleting request",
      });
    }
  }
}
