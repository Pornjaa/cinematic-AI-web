import { siteMetadata } from "@/lib/seo";
import { CharacterBuilderForm } from "@/components/ai/character-builder-form";

export const metadata = siteMetadata({
  title: "Character Builder",
  description: "สร้างตัวละครแบบ hyper realistic",
  path: "/ai-tools/character-builder"
});

export default function CharacterBuilderPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">AI Tools</p>
        <h1 className="mt-2 text-3xl font-bold">Character Builder</h1>
        <p className="mt-2 text-zinc-300">กรอกรายละเอียดตัวละคร แล้วให้ AI สร้าง Prompt แบบละเอียดที่สุด</p>
      </div>

      <CharacterBuilderForm />
    </section>
  );
}
