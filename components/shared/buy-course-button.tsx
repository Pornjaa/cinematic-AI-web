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

      const result = await parseJson(response);
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

      const uploaded = await uploadSlipFile(slipFile);
      if (!uploaded) {
        setLoading(false);
        return;
      }

      const slipRes = await fetch("/api/payments/slip-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: (result as { orderId: string }).orderId,
          slipImageUrl: uploaded.fileUrl,
          metadata: { key: uploaded.key, name: slipFile.name, size: String(slipFile.size) }
        })
      });

      const slipResult = await parseJson(slipRes);
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

  async function uploadSlipFile(file: File): Promise<{ fileUrl: string; key: string } | null> {
    try {
      const signRes = await fetch("/api/upload/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder: "slips",
          fileName: file.name,
          contentType: file.type || "image/jpeg"
        })
      });

      const sign = await parseJson(signRes);
      if (!signRes.ok || !(sign as { uploadUrl?: string }).uploadUrl) {
        return await uploadSlipFileViaServer(file);
      }

      const putRes = await fetch((sign as { uploadUrl: string }).uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file
      });

      if (!putRes.ok) {
        return await uploadSlipFileViaServer(file);
      }

      return { fileUrl: (sign as { fileUrl: string }).fileUrl, key: (sign as { key: string }).key };
    } catch {
      return await uploadSlipFileViaServer(file);
    }
  }

  async function uploadSlipFileViaServer(file: File): Promise<{ fileUrl: string; key: string } | null> {
    const form = new FormData();
    form.append("folder", "slips");
    form.append("file", file);

    const uploadRes = await fetch("/api/upload/direct", {
      method: "POST",
      body: form
    });
    const upload = await parseJson(uploadRes);

    if (!uploadRes.ok || !(upload as { fileUrl?: string }).fileUrl) {
      alert((upload as { error?: string }).error ?? "อัปโหลดสลิปไม่สำเร็จ");
      return null;
    }

    return { fileUrl: (upload as { fileUrl: string }).fileUrl, key: (upload as { key: string }).key };
  }

  async function parseJson(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return {};
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
