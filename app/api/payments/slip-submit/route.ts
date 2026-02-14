import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { notifyAdminNewSlip } from "@/lib/services";
import { slipSubmitSchema } from "@/lib/validators/payment";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = slipSubmitSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const order = await db.order.findFirst({
    where: {
      id: parsed.data.orderId,
      userId: session.user.id,
      status: "PENDING_VERIFICATION"
    }
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  await db.order.update({
    where: { id: order.id },
    data: {
      slipImageUrl: parsed.data.slipImageUrl,
      slipMetaJson: parsed.data.metadata,
      note: parsed.data.note
    }
  });

  await notifyAdminNewSlip(order.id);
  return NextResponse.json({ ok: true });
}
