import { z } from "zod";

export const createRequest = z.object({
  body: z
    .object({
      username: z.string().trim().min(1).max(20),
    })
    .strict(),
});

export const updateRequest = z.object({
  body: z
    .object({
      status: z.enum(["ACCEPTED", "REJECTED"]),
    })
    .strict(),
});
