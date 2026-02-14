import { db } from "@/lib/db";
import { sendFallbackEmail } from "@/lib/adapters/email";
import { sendTelegram } from "@/lib/adapters/telegram";
import { getBaseUrl } from "@/lib/base-url";

export async function notifyAdminNewSlip(orderId: string) {
  const baseUrl = getBaseUrl();
  const text = `New slip submitted\nOrder: ${orderId}\nReview: ${baseUrl}/admin/orders`;
  const sent = await sendTelegram(text);
  if (!sent) {
    await sendFallbackEmail("New slip waiting verification", text);
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
