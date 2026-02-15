"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl: "/my-courses"
    });

    if (!result || result.error) {
      setError("Username หรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
      return;
    }

    router.push(result?.url ?? "/my-courses");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-3xl cinematic-card p-6">
      <h1 className="text-xl font-semibold">เข้าสู่ระบบ</h1>
      <input className="w-full rounded-xl border border-white/15 p-2" placeholder="Username" onChange={(e) => setUsername(e.target.value)} value={username} />
      <input className="w-full rounded-xl border border-white/15 p-2" placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} value={password} />
      <button disabled={loading} className="w-full rounded-xl bg-brand-700 px-4 py-2 text-white disabled:opacity-60">
        {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
      </button>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <p className="text-sm text-zinc-300">
        ยังไม่มีบัญชี? <Link href="/register" className="text-brand-500 hover:text-brand-300">สมัครสมาชิก</Link>
      </p>
    </form>
  );
}
