import { NextResponse } from "next/server";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";
import { generateCharacterBuilder } from "@/lib/ai/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().optional().default(""),
  gender: z.string().optional().default(""),
  age: z.string().optional().default(""),
  skinTone: z.string().optional().default(""),
  hairColor: z.string().optional().default(""),
  hairStyle: z.string().optional().default(""),
  bodyType: z.string().optional().default(""),
  outfit: z.string().optional().default(""),
  pose: z.string().optional().default(""),
  cameraAngle: z.string().optional().default(""),
  shotSize: z.string().optional().default(""),
  timeOfDay: z.string().optional().default(""),
  location: z.string().optional().default(""),
  cameraType: z.string().optional().default(""),
  lens: z.string().optional().default(""),
  aspectRatio: z.string().optional().default("16:9"),
  notes: z.string().optional().default("")
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`ai-character-${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const result = await generateCharacterBuilder(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
