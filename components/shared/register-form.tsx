"use client";

import { useState } from "react";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error ?? "สมัครสมาชิกไม่สำเร็จ");
      return;
    }

    setMessage("สมัครสมาชิกสำเร็จ ไปหน้า login ได้เลย");
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-3xl cinematic-card p-6">
      <h1 className="text-xl font-semibold">สมัครสมาชิก</h1>
      <input className="w-full rounded-xl border border-white/15 p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="w-full rounded-xl border border-white/15 p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-xl border border-white/15 p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="w-full rounded-xl bg-brand-700 px-4 py-2 text-white">Create account</button>
      {message && <p className="text-sm text-zinc-200">{message}</p>}
    </form>
  );
}
