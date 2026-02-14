import { revalidatePath } from "next/cache";
import Link from "next/link";
import { db } from "@/lib/db";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function createTutorial(formData: FormData) {
  "use server";
  const rawSlug = String(formData.get("slug") || "").trim();
  const titleTh = String(formData.get("titleTh") || "").trim();
  const titleEn = String(formData.get("titleEn") || "").trim();
  const safeSlug = rawSlug || `${slugify(titleEn || titleTh || "free-tutorial")}-${Date.now()}`;

  await db.freeTutorial.create({
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
}

async function deleteTutorial(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;
  await db.freeTutorial.delete({ where: { id } });
  revalidatePath("/free-tutorials");
  revalidatePath("/");
  revalidatePath("/admin/free-tutorials");
}

export default async function AdminFreeTutorialPage() {
  const items = await db.freeTutorial.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Manage Free Tutorials</h1>
      <form action={createTutorial} className="grid gap-2 rounded-3xl cinematic-card p-5 md:grid-cols-2">
        <input name="slug" placeholder="slug (optional)" className="rounded-xl border border-white/15 p-2" />
        <input name="thumbnailUrl" placeholder="thumbnail url" className="rounded-xl border border-white/15 p-2" />
        <input name="titleTh" placeholder="title th" className="rounded-xl border border-white/15 p-2" required />
        <input name="titleEn" placeholder="title en" className="rounded-xl border border-white/15 p-2" required />
        <input name="descriptionTh" placeholder="description th" className="rounded-xl border border-white/15 p-2" />
        <input name="descriptionEn" placeholder="description en" className="rounded-xl border border-white/15 p-2" />
        <input name="externalVideoUrl" placeholder="video url" className="rounded-xl border border-white/15 p-2" />
        <input name="publishedAt" type="datetime-local" className="rounded-xl border border-white/15 p-2" />
        <select name="status" className="rounded-xl border border-white/15 p-2">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
        </select>
        <button className="rounded-xl bg-brand-700 px-4 py-2 text-white">Save tutorial</button>
      </form>

      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl cinematic-card p-4 text-sm">
          <p>{item.titleTh} ({item.slug}) - {item.status}</p>
          <div className="flex items-center gap-3">
            <Link href={`/admin/free-tutorials/${item.id}/edit`} className="text-brand-500">
              Edit
            </Link>
            <form action={deleteTutorial}>
              <input type="hidden" name="id" value={item.id} />
              <button className="rounded-full border border-rose-500/50 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/10">
                Delete
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
