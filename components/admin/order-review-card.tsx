"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  orderId: string;
  courseTitle: string;
  userEmail: string;
  slipImageUrl?: string | null;
};

export function OrderReviewCard({ orderId, courseTitle, userEmail, slipImageUrl }: Props) {
  const router = useRouter();

  async function review(action: "approve" | "reject") {
    const response = await fetch("/api/admin/order-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action })
    });

    if (!response.ok) {
      alert("Update failed");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-3xl cinematic-card p-5">
      <p className="font-medium">{courseTitle}</p>
      <p className="text-sm text-zinc-300">{userEmail}</p>
      {slipImageUrl && <Image src={slipImageUrl} alt="slip" width={480} height={280} className="rounded-xl border border-white/15 object-cover" />}
      <div className="flex gap-2">
        <button onClick={() => review("approve")} className="rounded-xl bg-brand-700 px-3 py-2 text-sm text-white">
          Approve
        </button>
        <button onClick={() => review("reject")} className="rounded-xl border border-rose-400 px-3 py-2 text-sm text-rose-600">
          Reject
        </button>
      </div>
    </div>
  );
}
