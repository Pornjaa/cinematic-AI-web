"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error ?? "สมัครสมาชิกไม่สำเร็จ");
      setLoading(false);
      return;
    }

    setMessage("สมัครสมาชิกสำเร็จ กำลังพาไปหน้า login...");
    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 700);
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-3xl cinematic-card p-6">
      <h1 className="text-xl font-semibold">สมัครสมาชิก</h1>
      <input className="w-full rounded-xl border border-white/15 p-2" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input className="w-full rounded-xl border border-white/15 p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-xl border border-white/15 p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button disabled={loading} className="w-full rounded-xl bg-brand-700 px-4 py-2 text-white disabled:opacity-60">
        {loading ? "กำลังสมัคร..." : "Create account"}
      </button>
      {message && <p className="text-sm text-zinc-200">{message}</p>}
    </form>
  );
}
