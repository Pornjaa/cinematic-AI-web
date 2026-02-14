"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/my-courses"
    });

    if (result?.error) {
      setError("Invalid credentials");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-3xl cinematic-card p-6">
      <h1 className="text-xl font-semibold">เข้าสู่ระบบ</h1>
      <input className="w-full rounded-xl border border-white/15 p-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} value={email} />
      <input className="w-full rounded-xl border border-white/15 p-2" placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} value={password} />
      <button className="w-full rounded-xl bg-brand-700 px-4 py-2 text-white">Login</button>
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </form>
  );
}
