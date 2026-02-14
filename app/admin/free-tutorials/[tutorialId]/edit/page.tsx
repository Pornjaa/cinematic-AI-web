import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default async function EditFreeTutorialPage({ params }: { params: Promise<{ tutorialId: string }> }) {
  const { tutorialId } = await params;
  const tutorial = await db.freeTutorial.findUnique({ where: { id: tutorialId } });
  if (!tutorial) notFound();

  async function updateTutorial(formData: FormData) {
    "use server";
    const rawSlug = String(formData.get("slug") || "").trim();
    const titleTh = String(formData.get("titleTh") || "").trim();
    const titleEn = String(formData.get("titleEn") || "").trim();
    const safeSlug = rawSlug || `${slugify(titleEn || titleTh || "free-tutorial")}-${Date.now()}`;

    await db.freeTutorial.update({
      where: { id: tutorialId },
      data: {
        slug: safeSlug,
        titleTh,
        titleEn,
        descriptionTh: String(formData.get("descriptionTh") || ""),
        descriptionEn: String(formData.get("descriptionEn") || ""),
        thumbnailUrl: String(formData.get("thumbnailUrl") || ""),
        externalVideoUrl: String(formData.get("externalVideoUrl") || ""),
        status: String(formData.get("status") || "DRAFT") as "DRAFT" | "PUBLISHED" | "SCHEDULED",
        publishedAt: formData.get("publishedAt") ? new Date(String(formData.get("publishedAt"))) : null
      }
    });

    revalidatePath("/free-tutorials");
    revalidatePath("/");
    revalidatePath("/admin/free-tutorials");
    revalidatePath(`/free-tutorials/${safeSlug}`);
  }

  const dateValue = tutorial.publishedAt ? new Date(tutorial.publishedAt.getTime() - tutorial.publishedAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Edit Free Tutorial</h1>
      <form action={updateTutorial} className="grid gap-2 rounded-3xl cinematic-card p-5 md:grid-cols-2">
        <input name="slug" placeholder="slug (optional)" className="rounded-xl border border-white/15 p-2" defaultValue={tutorial.slug} />
        <input name="thumbnailUrl" placeholder="thumbnail url" className="rounded-xl border border-white/15 p-2" defaultValue={tutorial.thumbnailUrl ?? ""} />
        <input name="titleTh" placeholder="title th" className="rounded-xl border border-white/15 p-2" defaultValue={tutorial.titleTh} required />
        <input name="titleEn" placeholder="title en" className="rounded-xl border border-white/15 p-2" defaultValue={tutorial.titleEn} required />
        <input name="descriptionTh" placeholder="description th" className="rounded-xl border border-white/15 p-2" defaultValue={tutorial.descriptionTh ?? ""} />
        <input name="descriptionEn" placeholder="description en" className="rounded-xl border border-white/15 p-2" defaultValue={tutorial.descriptionEn ?? ""} />
        <input name="externalVideoUrl" placeholder="video url" className="rounded-xl border border-white/15 p-2" defaultValue={tutorial.externalVideoUrl ?? ""} />
        <input name="publishedAt" type="datetime-local" className="rounded-xl border border-white/15 p-2" defaultValue={dateValue} />
        <select name="status" className="rounded-xl border border-white/15 p-2" defaultValue={tutorial.status}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
        </select>
        <button className="rounded-xl bg-brand-700 px-4 py-2 text-white">Save changes</button>
      </form>
    </div>
  );
}
