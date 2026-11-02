import { ConversationRepo } from "./repo.js";
import { MessageRepo } from "../message/repo.js";
import { io } from "../utils/socket.js";

export class ConversationController {
  static async index(req, res) {
    try {
      const conversations = await ConversationRepo.all({
        where: {
          members: {
            some: { userId: req.user.id },
          },
        },
        select: {
          id: true,
          members: {
            where: {
              userId: { not: req.user.id },
            },
            select: {
              user: {
                select: { username: true },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true },
          },
        },
      });

      conversations.sort((a, b) => {
        const aLastMessage = a.messages[0]?.createdAt?.getTime() ?? 0;
        const bLastMessage = b.messages[0]?.createdAt?.getTime() ?? 0;
        return bLastMessage - aLastMessage;
      });

      const result = conversations.map((conversation) => ({
        id: conversation.id,
        username: conversation.members[0]?.user.username ?? null,
      }));

      return res.json({ success: true, conversations: result });
    } catch (err) {
      console.error(err.message);
      return res.json({
        success: false,
        message: "Failed to retrieve conversations",
      });
    }
  }

  static async show(req, res) {
    try {
      const conversationId = req.validated.params.id;
      const userId = req.user.id;

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

      const seenAt = new Date();

      // Mark incoming unseen messages as seen.
      await MessageRepo.updateMany(
        {
          conversationId,
          senderId: { not: userId },
          seenAt: null,
        },
        {
          seenAt,
        },
      );

      const messages = await MessageRepo.all({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          sender: { select: { username: true } },
          isDeleted: true,
          isEdited: true,
          seenAt: true,
        },
      });

      const members = await ConversationRepo.find(
        { id: conversationId },
        {
          members: {
            where: { userId: { not: userId } },
            select: {
              user: { select: { username: true } },
            },
          },
        },
      );

      io.to(`conversation:${conversationId}`).emit("message:seen", {
        seenAt,
        seenBy: req.user.username,
      });

      return res.json({
        success: true,
        conversation: {
          id: conversationId,
          username: members.members[0]?.user.username,
          messages: messages.map((message) => ({
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            sender: message.sender.username,
            isEdited: message.isEdited,
            isDeleted: message.isDeleted,
            seenAt: message.seenAt,
          })),
        },
      });
    } catch (err) {
      console.error(err.message);

      return res.json({
        success: false,
        message: "Failed to retrieve conversation",
      });
    }
  }
}
