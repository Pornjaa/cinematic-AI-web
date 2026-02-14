import { z } from "zod";

export const commentSchema = z.object({
  body: z.string().min(2).max(1000),
  articleId: z.string().cuid().optional(),
  tutorialId: z.string().cuid().optional()
});
