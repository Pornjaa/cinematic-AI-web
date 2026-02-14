"use client";

import { useState } from "react";

type BankInfo = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  transferNote?: string;
};

export function BuyCourseButton({
  courseId,
  learningMode,
  bankInfo
}: {
  courseId: string;
  learningMode: "VIDEO" | "LIVE";
  bankInfo?: BankInfo | null;
}) {
  const [loading, setLoading] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);

  async function buy(method: "gateway" | "manual_slip") {
    try {
      setLoading(true);
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, method, learningMode })
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};
      if (!response.ok) {
        alert((result as { error?: string }).error ?? "Payment error");
        setLoading(false);
        return;
      }

      if (method === "gateway") {
        window.location.href = (result as { checkoutUrl: string }).checkoutUrl;
        return;
      }

      if (!slipFile) {
        alert("กรุณาเลือกไฟล์สลิปก่อน");
        setLoading(false);
        return;
      }

      const signRes = await fetch("/api/upload/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder: "slips",
          fileName: slipFile.name,
          contentType: slipFile.type || "image/jpeg"
        })
      });
      const signText = await signRes.text();
      const sign = signText ? JSON.parse(signText) : {};
      if (!signRes.ok || !(sign as { uploadUrl?: string }).uploadUrl) {
        alert((sign as { error?: string }).error ?? "ยังไม่ได้ตั้งค่าอัปโหลดสลิป (S3/R2)");
        setLoading(false);
        return;
      }

      const putRes = await fetch((sign as { uploadUrl: string }).uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": slipFile.type || "image/jpeg" },
        body: slipFile
      });
      if (!putRes.ok) {
        alert("Upload failed");
        setLoading(false);
        return;
      }

      const slipRes = await fetch("/api/payments/slip-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: (result as { orderId: string }).orderId,
          slipImageUrl: (sign as { fileUrl: string }).fileUrl,
          metadata: { key: (sign as { key: string }).key, name: slipFile.name, size: String(slipFile.size) }
        })
      });

      const slipText = await slipRes.text();
      const slipResult = slipText ? JSON.parse(slipText) : {};
      if (!slipRes.ok) {
        alert((slipResult as { error?: string }).error ?? "Slip submit failed");
        setLoading(false);
        return;
      }

      alert("ส่งสลิปแล้ว รอตรวจสอบ");
      setLoading(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Network error");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {bankInfo && (
        <div className="rounded-2xl border border-white/15 bg-black/30 p-3 text-sm">
          <p className="font-semibold">โอนผ่านบัญชีธนาคาร</p>
          <p className="text-zinc-300">ธนาคาร: {bankInfo.bankName}</p>
          <p className="text-zinc-300">ชื่อบัญชี: {bankInfo.accountName}</p>
          <p className="text-zinc-300">เลขบัญชี: {bankInfo.accountNumber}</p>
          {bankInfo.transferNote && <p className="mt-1 text-xs text-zinc-400">{bankInfo.transferNote}</p>}
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setSlipFile(event.target.files?.[0] ?? null)}
        className="w-full rounded-2xl cinematic-card px-3 py-2 text-sm"
      />
      <button disabled={loading} onClick={() => buy("gateway")} className="w-full rounded-xl bg-brand-700 px-4 py-2 text-white">
        ซื้อคอร์ส (PromptPay Gateway)
      </button>
      <button disabled={loading} onClick={() => buy("manual_slip")} className="w-full rounded-xl border border-brand-700 px-4 py-2 text-brand-700">
        โอนบัญชี + อัปโหลดสลิป
      </button>
    </div>
  );
}
