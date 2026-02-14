"use client";

import { useState } from "react";

type Result = {
  prompt: string;
};

export function PromptBuddyForm() {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/prompt-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");
      setResult({ prompt: data.prompt as string });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/15 bg-black/60 p-5">
      <div className="space-y-2">
        <label className="text-sm text-zinc-300">คำสั่งแบบสั้น</label>
        <textarea
          className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-sm"
          rows={4}
          placeholder="เช่น: หญิงสาวนั่งไลฟ์สดขายของในห้องนอน"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !goal.trim()}
        className="rounded-full bg-brand-700 px-5 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "กำลังสร้าง..." : "สร้าง Flash Prompt"}
      </button>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {result?.prompt ? (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-black/40 p-4">
          <p className="text-sm text-zinc-300">ผลลัพธ์</p>
          <pre className="whitespace-pre-wrap text-sm text-white">{result.prompt}</pre>
        </div>
      ) : null}
    </div>
  );
}
