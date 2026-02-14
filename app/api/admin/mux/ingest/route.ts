import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { createMuxAsset } from "@/lib/adapters/mux";

const schema = z.object({
  inputUrl: z.string().url()
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

  const asset = await createMuxAsset(parsed.data.inputUrl);
  if (!asset) {
    return NextResponse.json({ error: "Mux is not configured" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, ...asset });
}
