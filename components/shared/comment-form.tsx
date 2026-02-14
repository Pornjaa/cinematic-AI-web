"use client";

import { useState } from "react";

export function CommentForm({ articleId, tutorialId }: { articleId?: string; tutorialId?: string }) {
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");

  async function submitComment() {
    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, articleId, tutorialId })
    });

    if (!response.ok) {
      setStatus("ส่งคอมเมนต์ไม่สำเร็จ");
      return;
    }

    setStatus("ส่งคอมเมนต์แล้ว");
    setBody("");
  }

  return (
    <div className="space-y-2">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        className="w-full rounded-xl border border-white/15 p-3"
        rows={4}
        placeholder="เขียนคอมเมนต์"
      />
      <button onClick={submitComment} className="rounded-xl bg-brand-700 px-4 py-2 text-sm text-white">
        ส่งคอมเมนต์
      </button>
      {status && <p className="text-sm text-zinc-300">{status}</p>}
    </div>
  );
}
