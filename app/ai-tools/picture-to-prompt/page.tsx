import { siteMetadata } from "@/lib/seo";
import { PictureToPromptForm } from "@/components/ai/picture-to-prompt-form";

export const metadata = siteMetadata({
  title: "Picture to Prompt",
  description: "แปลงภาพเป็น Prompt",
  path: "/ai-tools/picture-to-prompt"
});

export default function PictureToPromptPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">AI Tools</p>
        <h1 className="mt-2 text-3xl font-bold">Picture to Prompt</h1>
        <p className="mt-2 text-zinc-300">
          อัปโหลดภาพ แล้วรับ Prompt ภาษาอังกฤษ + คำอธิบายภาษาไทย
        </p>
      </div>

      <PictureToPromptForm />
    </section>
  );
}
