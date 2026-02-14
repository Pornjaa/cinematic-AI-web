import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const schema = z.object({
  target: z.enum(["section", "lesson"]),
  ids: z.array(z.string().cuid())
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await db.$transaction(
    parsed.data.ids.map((id, idx) =>
      parsed.data.target === "section"
        ? db.courseSection.update({ where: { id }, data: { position: idx + 1 } })
        : db.lesson.update({ where: { id }, data: { position: idx + 1 } })
    )
  );

  return NextResponse.json({ ok: true });
}
