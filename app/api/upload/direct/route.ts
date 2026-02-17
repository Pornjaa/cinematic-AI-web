import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadObject } from "@/lib/adapters/s3";

const allowedFolders = new Set(["images", "slips", "videos", "docs"]);

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const folderRaw = String(form.get("folder") ?? "images");
  const folder = allowedFolders.has(folderRaw) ? folderRaw : "images";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `${folder}/${session.user.id}/${Date.now()}-${cleanFileName}`;
  const contentType = file.type || "application/octet-stream";
  const body = new Uint8Array(await file.arrayBuffer());

  const uploaded = await uploadObject({ key, contentType, body });
  return NextResponse.json({ ok: true, key, fileUrl: uploaded.fileUrl });
}
