import Link from "next/link";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Admin AI Tools",
  description: "Admin AI tools hub",
  path: "/admin/ai-tools",
  noindex: true
});

export default function AdminAiToolsPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Admin</p>
        <h1 className="mt-2 text-2xl font-bold">AI Tools</h1>
        <p className="mt-2 text-zinc-300">จัดการและตั้งค่าเครื่องมือ AI</p>
      </div>

      <div className="rounded-3xl border border-white/15 bg-black/60 p-5">
        <h2 className="text-lg font-semibold">AI Prompt Buddy</h2>
        <p className="mt-2 text-sm text-zinc-300">
          ฟังก์ชันนี้จะเชื่อมต่อ Gemini API เพื่อช่วยสร้าง Prompt
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-full bg-brand-700 px-5 py-2 text-sm text-white" disabled>
            ยังไม่เปิดใช้งาน
          </button>
          <Link href="/ai-tools" className="rounded-full border border-white/20 px-5 py-2 text-sm text-white">
            เปิดหน้าใช้งาน
          </Link>
        </div>
      </div>
    </section>
  );
}
