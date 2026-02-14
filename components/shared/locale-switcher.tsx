"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LocaleSwitcher() {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function setLocale(locale: "th" | "en") {
    setPending(true);
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale })
    });
    router.refresh();
    setPending(false);
  }

  return (
    <div className="inline-flex rounded-full border border-white/20 bg-black/40 p-1 text-xs text-zinc-100 shadow-[0_8px_20px_rgba(0,0,0,0.3)]">
      <button disabled={pending} onClick={() => setLocale("th")} className="rounded-full px-3 py-1 hover:bg-white/10">
        TH
      </button>
      <button disabled={pending} onClick={() => setLocale("en")} className="rounded-full px-3 py-1 hover:bg-white/10">
        EN
      </button>
    </div>
  );
}
