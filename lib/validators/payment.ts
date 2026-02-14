import { z } from "zod";

export const initiatePaymentSchema = z.object({
  courseId: z.string().cuid(),
  method: z.enum(["gateway", "manual_slip"]),
  learningMode: z.enum(["VIDEO", "LIVE"]).default("VIDEO")
});

export const slipSubmitSchema = z.object({
  orderId: z.string().cuid(),
  slipImageUrl: z.string().url(),
  note: z.string().max(250).optional(),
  metadata: z.record(z.string(), z.string()).optional()
});
