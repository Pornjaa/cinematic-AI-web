import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { commentSchema } from "@/lib/validators/comment";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? session.user.id;
  if (isRateLimited(`comment:${ip}`, 10, 60000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const parsed = commentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const comment = await db.comment.create({
    data: {
      body: parsed.data.body,
      articleId: parsed.data.articleId,
      tutorialId: parsed.data.tutorialId,
      userId: session.user.id,
      isApproved: true
    }
  });

  return NextResponse.json({ ok: true, commentId: comment.id });
}
