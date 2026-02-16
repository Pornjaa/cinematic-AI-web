import { db } from "@/lib/db";
import { sendFallbackEmail } from "@/lib/adapters/email";
import { sendTelegram } from "@/lib/adapters/telegram";
import { getBaseUrl } from "@/lib/base-url";
import { logger } from "@/lib/logger";

export async function notifyAdminNewSlip(orderId: string) {
  const baseUrl = getBaseUrl();
  const text = `New slip submitted\nOrder: ${orderId}\nReview: ${baseUrl}/admin/orders`;

  const adminUsers = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true }
  });
  const adminEmails = adminUsers.map((item) => item.email).filter(Boolean);

  const emailSent = await sendFallbackEmail("New slip waiting verification", text, adminEmails);
  const telegramSent = await sendTelegram(text);

  if (!emailSent && !telegramSent) {
    logger.warn("No admin notification channel delivered", { orderId, adminEmailsCount: adminEmails.length });
  }
}

export async function approveOrderAndEnroll(orderId: string) {
  const order = await db.order.update({
    where: { id: orderId },
    data: { status: "PAID" }
  });

  await db.enrollment.upsert({
    where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
    update: {},
    create: {
      userId: order.userId,
      courseId: order.courseId,
      orderId: order.id
    }
  });
}
