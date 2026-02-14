"use client";

import { useMemo, useState } from "react";
import { BuyCourseButton } from "@/components/shared/buy-course-button";

export type LearningModeOption = {
  mode: "VIDEO" | "LIVE";
  label: string;
  priceTHB: number;
};

type BankInfo = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  transferNote?: string;
};

export function CoursePurchasePanel({
  courseId,
  options,
  bankInfo
}: {
  courseId: string;
  options: LearningModeOption[];
  bankInfo?: BankInfo | null;
}) {
  const [selectedMode, setSelectedMode] = useState<"VIDEO" | "LIVE">(options[0]?.mode ?? "VIDEO");

  const selected = useMemo(() => options.find((opt) => opt.mode === selectedMode), [options, selectedMode]);

  if (options.length === 0) {
    return <p className="text-sm text-zinc-400">คอร์สนี้ยังไม่เปิดขาย</p>;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.mode} className="flex cursor-pointer items-center justify-between rounded-xl border border-white/15 px-3 py-2">
            <span className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="learningMode"
                value={option.mode}
                checked={selectedMode === option.mode}
                onChange={() => setSelectedMode(option.mode)}
              />
              {option.label}
            </span>
            <span className="text-sm font-semibold text-brand-500">{option.priceTHB.toLocaleString()} THB</span>
          </label>
        ))}
      </div>

      <p className="text-2xl font-semibold text-brand-500">{selected?.priceTHB.toLocaleString()} THB</p>
      <BuyCourseButton courseId={courseId} learningMode={selectedMode} bankInfo={bankInfo} />
    </div>
  );
}
