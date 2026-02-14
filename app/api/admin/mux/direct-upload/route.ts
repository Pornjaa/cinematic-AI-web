import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createMuxDirectUpload, getMuxUploadPlayback } from "@/lib/adapters/mux";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const upload = await createMuxDirectUpload();
  if (!upload) {
    return NextResponse.json({ error: "Mux is not configured" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, ...upload });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get("uploadId");
  if (!uploadId) {
    return NextResponse.json({ error: "uploadId is required" }, { status: 400 });
  }

  const payload = await getMuxUploadPlayback(uploadId);
  if (!payload) {
    return NextResponse.json({ error: "Mux is not configured" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, ...payload });
}
