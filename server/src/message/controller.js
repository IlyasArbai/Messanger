import { MessageRepo } from "./repo.js";
import { ConversationRepo } from "#src/conversation/repo.js";
import { io } from "../utils/socket.js";

export class MessageController {
  static async store(req, res) {
    try {
      const { conversationId, content } = req.validated.body;
      const conversation = await ConversationRepo.find(
        {
          id: conversationId,
          members: { some: { userId: req.user.id } },
        },
        {
          id: true,
          members: {
            where: {
              userId: {
                not: req.user.id,
              },
            },
            select: {
              userId: true,
            },
          },
        },
      );
      if (!conversation)
        return res.json({
          success: false,
          message: "Conversation not found",
        });

      const message = await MessageRepo.create(
        {
          conversationId,
          senderId: req.user.id,
          content,
        },
        {
          id: true,
          conversationId: true,
          content: true,
          isDeleted: true,
          isEdited: true,
          createdAt: true,
          sender: { select: { username: true } },
        },
      );
      console.log(message);

      io.to(`conversation:${message.conversationId}`).emit("message:new", {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender.username,
        isEdited: message.isEdited,
        isDeleted: message.isDeleted,
        seenAt: message.seenAt,
        conversationId: message.conversationId,
      });

      return res.json({
        success: true,
        message,
      });
    } catch (err) {
      console.error(err.message);
      return res.json({
        success: false,
        message: "Failed to send message",
      });
    }
  }

  static async edit(req, res) {
    try {
      const { id } = req.validated.params;
      const { content } = req.validated.body;

      const message = await MessageRepo.find(
        { id },
        {
          id: true,
          senderId: true,
          isDeleted: true,
          conversation: {
            select: {
              members: {
                where: { userId: req.user.id },
                select: { userId: true },
              },
            },
          },
        },
      );

      if (
        !message ||
        message.senderId !== req.user.id ||
        message.conversation.members.length === 0 ||
        message.isDeleted
      )
        return res.json({
          success: false,
          message: "You can't edit this message",
        });

      const updatedMessage = await MessageRepo.update(id, {
        content,
        isEdited: true,
      });

      io.to(`conversation:${updatedMessage.conversationId}`).emit(
        "message:edited",
        {
          conversationId: updatedMessage.conversationId,
          messageId: updatedMessage.id,
          content: updatedMessage.content,
        },
      );

      return res.json({
        success: true,
        message: updatedMessage,
      });
    } catch (err) {
      console.error(err.message);
      return res.json({
        success: false,
        message: "Failed to edit message",
      });
    }
  }

  static async destroy(req, res) {
    try {
      const { id } = req.validated.params;

      const message = await MessageRepo.find(
        { id },
        {
          id: true,
          senderId: true,
          isDeleted: true,
          conversation: {
            select: {
              members: {
                where: { userId: req.user.id },
                select: { userId: true },
              },
            },
          },
        },
      );

      if (
        !message ||
        message.senderId !== req.user.id ||
        message.conversation.members.length === 0 ||
        message.isDeleted
      )
        return res.json({
          success: false,
          message: "You can't delete this message",
        });

      const deletedMessage = await MessageRepo.update(id, {
        isDeleted: true,
        content: null,
      });

      io.to(`conversation:${deletedMessage.conversationId}`).emit(
        "message:deleted",
        {
          conversationId: deletedMessage.conversationId,
          messageId: deletedMessage.id,
          content: deletedMessage.content,
        },
      );

      return res.json({
        success: true,
        message: deletedMessage,
      });
    } catch (err) {
      console.error(err.message);
      return res.json({
        success: false,
        message: "Failed to delete message",
      });
    }
  }
}
