import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments/factory";
import { initiatePaymentSchema } from "@/lib/validators/payment";
import { isRateLimited } from "@/lib/rate-limit";
import { toAbsoluteUrl } from "@/lib/base-url";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ip = request.headers.get("x-forwarded-for") ?? session.user.id;
  if (isRateLimited(`payment:init:${ip}`, 6, 60000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = initiatePaymentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const course = await db.course.findUnique({ where: { id: parsed.data.courseId } });
  if (!course || course.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Course not available" }, { status: 404 });
  }
  const amountTHB =
    parsed.data.learningMode === "VIDEO"
      ? course.videoEnabled
        ? course.videoPriceTHB ?? null
        : null
      : course.liveEnabled
        ? course.livePriceTHB ?? null
        : null;

  if (!amountTHB) {
    return NextResponse.json({ error: "Selected learning mode is unavailable" }, { status: 400 });
  }

  const order = await db.order.create({
    data: {
      userId: session.user.id,
      courseId: course.id,
      amountTHB,
      paymentMethod: parsed.data.method === "gateway" ? "OMISE" : "MANUAL_SLIP",
      status: parsed.data.method === "gateway" ? "PENDING_PAYMENT" : "PENDING_VERIFICATION",
      note: `learningMode:${parsed.data.learningMode}`
    }
  });

  if (parsed.data.method === "manual_slip") {
    return NextResponse.json({ ok: true, orderId: order.id });
  }

  const provider = getPaymentProvider();
  const checkout = await provider.createCheckout({
    orderId: order.id,
    amountTHB: order.amountTHB,
    courseTitle: course.titleTh,
    userEmail: session.user.email ?? "",
    returnUrl: toAbsoluteUrl("/my-courses")
  });

  await db.order.update({
    where: { id: order.id },
    data: {
      paymentProviderRef: checkout.providerRef,
      paymentMethod: provider.providerName === "stripe" ? "STRIPE" : "OMISE"
    }
  });

  return NextResponse.json({ ok: true, checkoutUrl: checkout.checkoutUrl, orderId: order.id });
}
