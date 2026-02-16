import { logger } from "@/lib/logger";

export async function sendFallbackEmail(subject: string, body: string, recipients?: string[]) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const to = normalizeRecipients(recipients);

  if (!to.length) {
    logger.warn("Email notify skipped: no recipients");
    return false;
  }

  if (!resendApiKey || !fromEmail) {
    logger.warn("Email notify skipped: RESEND_API_KEY or RESEND_FROM_EMAIL missing", {
      toCount: to.length
    });
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      text: body
    })
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => "");
    logger.error("Email notify failed", {
      status: response.status,
      responseText
    });
    return false;
  }

  return true;
}

function normalizeRecipients(recipients?: string[]) {
  const envRecipient = process.env.ADMIN_FALLBACK_EMAIL?.trim();
  const merged = [...(recipients ?? []), ...(envRecipient ? [envRecipient] : [])];
  return [...new Set(merged.map((item) => item.trim()).filter(Boolean))];
}
