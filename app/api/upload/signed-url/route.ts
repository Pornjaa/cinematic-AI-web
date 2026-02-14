import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSignedUploadUrl } from "@/lib/adapters/s3";
import { z } from "zod";

const schema = z.object({
  fileName: z.string().min(3),
  contentType: z.string().min(3),
  folder: z.enum(["images", "slips", "videos", "docs"]).default("images")
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const cleanFileName = parsed.data.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `${parsed.data.folder}/${session.user.id}/${Date.now()}-${cleanFileName}`;

  const signed = await createSignedUploadUrl(key, parsed.data.contentType);
  return NextResponse.json({ ok: true, ...signed, key });
}
