import { siteMetadata } from "@/lib/seo";
import { SceneBuildingForm } from "@/components/ai/scene-building-form";

export const metadata = siteMetadata({
  title: "Scene Building",
  description: "แตกเรื่องเล่าเป็นฉากพร้อม prompt",
  path: "/ai-tools/scene-building"
});

export default function SceneBuildingPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">AI Tools</p>
        <h1 className="mt-2 text-3xl font-bold">Scene Building</h1>
        <p className="mt-2 text-zinc-300">
          เล่าเรื่องสั้น ๆ แล้วให้ AI แตกเป็นหลายฉากพร้อมอธิบายการเล่าเรื่อง
        </p>
      </div>

      <SceneBuildingForm />
    </section>
  );
}
