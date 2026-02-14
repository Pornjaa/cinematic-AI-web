import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { approveOrderAndEnroll } from "@/lib/services";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().cuid(),
  action: z.enum(["approve", "reject"])
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const payload =
    contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries(await request.formData());

  const parsed = schema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  if (parsed.data.action === "approve") {
    await approveOrderAndEnroll(parsed.data.orderId);
    return NextResponse.json({ ok: true });
  }

  await db.order.update({
    where: { id: parsed.data.orderId },
    data: { status: "REJECTED" }
  });

  return NextResponse.json({ ok: true });
}
