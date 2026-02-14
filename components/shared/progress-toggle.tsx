"use client";

import { useState } from "react";

export function ProgressToggle({ lessonId, initialCompleted }: { lessonId: string; initialCompleted: boolean }) {
  const [done, setDone] = useState(initialCompleted);

  async function toggle() {
    const next = !done;
    setDone(next);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, completed: next })
    });
  }

  return (
    <button onClick={toggle} className="rounded-xl border border-brand-700 px-3 py-2 text-sm text-brand-700">
      {done ? "Mark as incomplete" : "Mark as complete"}
    </button>
  );
}
