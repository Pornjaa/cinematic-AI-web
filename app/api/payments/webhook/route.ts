import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments/factory";
import { approveOrderAndEnroll } from "@/lib/services";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`webhook:${ip}`, 40, 60000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");
  const provider = getPaymentProvider();
  const verified = await provider.verifyWebhook(rawBody, signature);

  if (!verified.valid || !verified.ref) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
  }

  const order = await db.order.findFirst({
    where: { paymentProviderRef: verified.ref }
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await approveOrderAndEnroll(order.id);
  return NextResponse.json({ ok: true });
}
