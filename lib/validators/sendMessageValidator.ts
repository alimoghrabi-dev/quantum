import z from "zod";

export const SendMessagValidator = z.object({
  fileId: z.string(),
  message: z.string(),
});
