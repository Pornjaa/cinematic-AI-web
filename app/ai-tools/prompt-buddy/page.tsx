import { siteMetadata } from "@/lib/seo";
import { PromptBuddyForm } from "@/components/ai/prompt-buddy-form";

export const metadata = siteMetadata({
  title: "Flash Prompt",
  description: "สร้าง prompt แบบรวดเร็ว",
  path: "/ai-tools/prompt-buddy"
});

export default function PromptBuddyPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">AI Tools</p>
        <h1 className="mt-2 text-3xl font-bold">Flash Prompt</h1>
        <p className="mt-2 text-zinc-300">พิมพ์คำสั่งสั้น ๆ แล้วได้ prompt ภาษาอังกฤษแบบละเอียด</p>
      </div>

      <PromptBuddyForm />
    </section>
  );
}
