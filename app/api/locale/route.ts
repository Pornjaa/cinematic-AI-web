import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  locale: z.enum(["th", "en"])
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("NEXT_LOCALE", parsed.data.locale, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false
  });
  return response;
}
