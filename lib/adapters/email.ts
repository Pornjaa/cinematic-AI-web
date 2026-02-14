import { logger } from "@/lib/logger";

export async function sendFallbackEmail(subject: string, body: string) {
  logger.info("Email fallback placeholder", {
    subject,
    body,
    to: process.env.ADMIN_FALLBACK_EMAIL
  });
}
