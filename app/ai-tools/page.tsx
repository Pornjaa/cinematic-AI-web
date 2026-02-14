import Link from "next/link";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "AI Tools",
  description: "AI tools hub",
  path: "/ai-tools"
});

export default function AIToolsPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">AI Tools</p>
        <h1 className="mt-2 text-3xl font-bold">ศูนย์รวมฟังก์ชัน AI</h1>
        <p className="mt-2 text-zinc-300">เลือกเครื่องมือที่ต้องการใช้งาน</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/15 bg-black/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <h2 className="text-lg font-semibold">Flash Prompt</h2>
          <p className="mt-2 text-sm text-zinc-300">
            สร้าง prompt แบบรวดเร็วจากคำสั่งสั้น ๆ
          </p>
          <Link
            href="/ai-tools/prompt-buddy"
            className="mt-4 inline-flex rounded-full bg-brand-700 px-5 py-2 text-sm text-white shadow-[0_10px_24px_rgba(225,29,72,0.35)]"
          >
            เปิดใช้งาน
          </Link>
        </div>
        <div className="rounded-3xl border border-white/15 bg-black/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <h2 className="text-lg font-semibold">Picture to Prompt</h2>
          <p className="mt-2 text-sm text-zinc-300">
            แปลงภาพเป็น Prompt ภาษาอังกฤษ พร้อมคำอธิบายภาษาไทย
          </p>
          <Link
            href="/ai-tools/picture-to-prompt"
            className="mt-4 inline-flex rounded-full bg-brand-700 px-5 py-2 text-sm text-white shadow-[0_10px_24px_rgba(225,29,72,0.35)]"
          >
            เปิดใช้งาน
          </Link>
        </div>
        <div className="rounded-3xl border border-white/15 bg-black/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <h2 className="text-lg font-semibold">Character Builder</h2>
          <p className="mt-2 text-sm text-zinc-300">
            สร้างตัวละครแบบ hyper realistic จากข้อมูลที่กรอก
          </p>
          <Link
            href="/ai-tools/character-builder"
            className="mt-4 inline-flex rounded-full bg-brand-700 px-5 py-2 text-sm text-white shadow-[0_10px_24px_rgba(225,29,72,0.35)]"
          >
            เปิดใช้งาน
          </Link>
        </div>
        <div className="rounded-3xl border border-white/15 bg-black/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <h2 className="text-lg font-semibold">Scene Building</h2>
          <p className="mt-2 text-sm text-zinc-300">
            แตกเรื่องเล่าเป็นฉาก พร้อม prompt และคำอธิบายไทย
          </p>
          <Link
            href="/ai-tools/scene-building"
            className="mt-4 inline-flex rounded-full bg-brand-700 px-5 py-2 text-sm text-white shadow-[0_10px_24px_rgba(225,29,72,0.35)]"
          >
            เปิดใช้งาน
          </Link>
        </div>
      </div>

      <Link href="/" className="inline-flex text-sm text-zinc-300 underline">
        กลับหน้าแรก
      </Link>
    </section>
  );
}
