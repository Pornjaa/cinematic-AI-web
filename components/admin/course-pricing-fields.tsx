"use client";

import { useState } from "react";

type Props = {
  defaultVideoEnabled?: boolean;
  defaultVideoPrice?: number | null;
  defaultLiveEnabled?: boolean;
  defaultLivePrice?: number | null;
};

export function CoursePricingFields({
  defaultVideoEnabled = true,
  defaultVideoPrice = 990,
  defaultLiveEnabled = true,
  defaultLivePrice = 3000
}: Props) {
  const [videoEnabled, setVideoEnabled] = useState(defaultVideoEnabled);
  const [liveEnabled, setLiveEnabled] = useState(defaultLiveEnabled);

  return (
    <div className="rounded-2xl border border-white/15 p-4 md:col-span-2">
      <p className="mb-2 text-sm font-semibold">รูปแบบการเรียนและราคา</p>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2 rounded-xl border border-white/10 p-3">
          <span className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="videoEnabled" checked={videoEnabled} onChange={(e) => setVideoEnabled(e.target.checked)} />
            เรียนผ่านคลิป
          </span>
          <input
            type="number"
            name="videoPriceTHB"
            placeholder="ราคาเรียนคลิป (เช่น 990)"
            defaultValue={defaultVideoPrice ?? 990}
            disabled={!videoEnabled}
            className="w-full rounded-xl border border-white/15 p-2 disabled:opacity-40"
          />
        </label>

        <label className="space-y-2 rounded-xl border border-white/10 p-3">
          <span className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="liveEnabled" checked={liveEnabled} onChange={(e) => setLiveEnabled(e.target.checked)} />
            สอนสดตัวต่อตัวออนไลน์
          </span>
          <input
            type="number"
            name="livePriceTHB"
            placeholder="ราคาสอนสด (เช่น 3000)"
            defaultValue={defaultLivePrice ?? 3000}
            disabled={!liveEnabled}
            className="w-full rounded-xl border border-white/15 p-2 disabled:opacity-40"
          />
        </label>
      </div>
      <p className="mt-2 text-xs text-zinc-400">ปิด checkbox ได้ถ้าคอร์สนั้นไม่มีรูปแบบการเรียนดังกล่าว</p>
    </div>
  );
}
