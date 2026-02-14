"use client";

import { useState } from "react";

type Scene = {
  title: string;
  prompt: string;
  explanation: string;
};

type Result = {
  genre: string;
  scenes: Scene[];
};

export function SceneBuildingForm() {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/scene-building", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");
      setResult(data as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/15 bg-black/60 p-5">
      <div className="space-y-2">
        <label className="text-sm text-zinc-300">เรื่องเล่าที่ต้องการให้แตกเป็นฉาก</label>
        <textarea
          className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-sm"
          rows={6}
          placeholder="เล่าเรื่องสั้น ๆ เช่น โทนหนัง/อารมณ์/เหตุการณ์หลัก"
          value={story}
          onChange={(e) => setStory(e.target.value)}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || story.trim().length < 10}
        className="rounded-full bg-brand-700 px-5 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "กำลังวิเคราะห์..." : "สร้าง Scene Breakdown"}
      </button>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {result ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">แนวเรื่องที่วิเคราะห์ได้</p>
            <p className="text-sm text-white">{result.genre}</p>
          </div>

          {result.scenes.map((scene, idx) => (
            <div key={`${scene.title}-${idx}`} className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Scene {idx + 1}</p>
              <p className="text-sm font-semibold text-white">{scene.title}</p>
              <div className="mt-3">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Prompt (English)</p>
                <pre className="whitespace-pre-wrap text-sm text-white">{scene.prompt}</pre>
              </div>
              <div className="mt-3">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">คำอธิบาย (ไทย)</p>
                <p className="text-sm text-zinc-200 whitespace-pre-wrap">{scene.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
