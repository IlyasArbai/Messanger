import { z } from "zod";

export const createMessageSchema = z.object({
  body: z
    .object({
      conversationId: z.coerce.number().int().positive(),
      content: z.string().trim().min(1).max(100),
    })
    .strict(),
});

export const updateMessageSchema = z.object({
  body: z
    .object({
      content: z.string().trim().min(1).max(100),
    })
    .strict(),
});