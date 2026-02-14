import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  lessonId: z.string().cuid(),
  completed: z.boolean().default(true)
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId: parsed.data.lessonId } },
    update: {
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null
    },
    create: {
      userId: session.user.id,
      lessonId: parsed.data.lessonId,
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null
    }
  });

  return NextResponse.json({ ok: true });
}
