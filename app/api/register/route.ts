import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isRateLimited } from "@/lib/rate-limit";

const schema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9._-]+$/, "Invalid username")
    .transform((value) => value.trim().toLowerCase()),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`register:${ip}`, 8, 60000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const exists = await db.user.findFirst({
    where: {
      OR: [
        { email: { equals: parsed.data.email, mode: "insensitive" } },
        { username: { equals: parsed.data.username, mode: "insensitive" } }
      ]
    }
  });
  if (exists) {
    if (exists.email.toLowerCase() === parsed.data.email.toLowerCase()) {
      return NextResponse.json({ error: "Email already used" }, { status: 409 });
    }
    return NextResponse.json({ error: "Username already used" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await db.user.create({
    data: {
      username: parsed.data.username,
      name: parsed.data.username,
      email: parsed.data.email,
      passwordHash
    }
  });

  return NextResponse.json({ ok: true });
}
