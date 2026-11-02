import { z } from "zod";

export const searchUsersSchema = z.object({
  query: z.object({
    q: z.string().trim().min(1).max(20),
  }),
});

export const checkUsername = z.object({
  body: z.object({
    username: z.string().trim().min(1).max(20),
  }),
});
