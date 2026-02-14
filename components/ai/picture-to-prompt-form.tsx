"use client";

import { useState } from "react";

type Result = {
  prompt: string;
  explanation: string;
  styleName: string;
};

export function PictureToPromptForm() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!imageFile) {
      setError("กรุณาอัปโหลดภาพ");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const base64 = await fileToBase64(imageFile);
      const res = await fetch("/api/ai/picture-to-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          focus: focus.trim() || null
        })
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
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">อัปโหลดภาพ</label>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-white/15 bg-black/40 p-2 text-sm"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-zinc-300">โฟกัสส่วนไหนของภาพ (ไม่ใส่ก็ได้)</label>
          <textarea
            className="w-full rounded-xl border border-white/15 bg-black/40 p-3 text-sm"
            rows={4}
            placeholder="เช่น: โทนสี, แสง, ฉากหลัง, อารมณ์ตัวละคร"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="rounded-full bg-brand-700 px-5 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "กำลังวิเคราะห์..." : "สร้าง Prompt"}
      </button>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {result ? (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Prompt (English)</p>
            <pre className="whitespace-pre-wrap text-sm text-white">{result.prompt}</pre>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">ภาพนี้เรียกว่า</p>
            <p className="text-sm text-white">{result.styleName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">คำอธิบาย (ไทย)</p>
            <p className="text-sm text-zinc-200 whitespace-pre-wrap">{result.explanation}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Cannot read file"));
    reader.readAsDataURL(file);
  });
}
