import { z } from "zod";

export const localizedTextSchema = z.object({
  th: z.string().min(1),
  en: z.string().min(1)
});

export const slugSchema = z
  .string()
  .min(3)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");
