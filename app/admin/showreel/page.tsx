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

async function createShowreel(formData: FormData) {
  "use server";
  const rawSlug = String(formData.get("slug") || "").trim();
  const rawVideoUrl = String(formData.get("externalVideoUrl") || "").trim();
  const isSlugUrl = /^https?:\/\//i.test(rawSlug);

  const titleTh = String(formData.get("titleTh") || "").trim();
  const titleEn = String(formData.get("titleEn") || "").trim();
  const fallbackSlugBase = slugify(titleEn || titleTh || "showreel");
  const safeSlug = isSlugUrl || !rawSlug ? `${fallbackSlugBase}-${Date.now()}` : rawSlug;
  const externalVideoUrl = rawVideoUrl || (isSlugUrl ? rawSlug : "");

  await db.showreel.create({
    data: {
      slug: safeSlug,
      titleTh,
      titleEn,
      descriptionTh: String(formData.get("descriptionTh") || ""),
      descriptionEn: String(formData.get("descriptionEn") || ""),
      thumbnailUrl: String(formData.get("thumbnailUrl") || ""),
      externalVideoUrl,
      status: String(formData.get("status") || "PUBLISHED") as "DRAFT" | "PUBLISHED" | "SCHEDULED",
      publishedAt: formData.get("publishedAt") ? new Date(String(formData.get("publishedAt"))) : null,
      position: Number(formData.get("position") || 0)
    }
  });
  revalidatePath("/showreel");
}

async function deleteShowreel(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;
  await db.showreel.delete({ where: { id } });
  revalidatePath("/showreel");
}

export default async function AdminShowreelPage() {
  const items = await db.showreel.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] });
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Manage Showreel</h1>
      <form action={createShowreel} className="grid gap-2 rounded-3xl cinematic-card p-5 md:grid-cols-2">
        <input name="slug" placeholder="slug (optional)" className="rounded-xl border border-white/15 p-2" />
        <input name="position" placeholder="position" type="number" className="rounded-xl border border-white/15 p-2" defaultValue={items.length + 1} />
        <input name="titleTh" placeholder="title th" className="rounded-xl border border-white/15 p-2" required />
        <input name="titleEn" placeholder="title en" className="rounded-xl border border-white/15 p-2" required />
        <input name="descriptionTh" placeholder="description th" className="rounded-xl border border-white/15 p-2" />
        <input name="descriptionEn" placeholder="description en" className="rounded-xl border border-white/15 p-2" />
        <input name="thumbnailUrl" placeholder="thumbnail url" className="rounded-xl border border-white/15 p-2" />
        <input name="externalVideoUrl" placeholder="video url" className="rounded-xl border border-white/15 p-2" />
        <input name="publishedAt" type="datetime-local" className="rounded-xl border border-white/15 p-2" />
        <select name="status" className="rounded-xl border border-white/15 p-2" defaultValue="PUBLISHED">
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
        </select>
        <button className="rounded-xl bg-brand-700 px-4 py-2 text-white md:col-span-2">Save</button>
      </form>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl cinematic-card p-4 text-sm">
            <p>
              {item.titleTh} ({item.slug}) - {item.status}
              {item.externalVideoUrl ? ` - ${item.externalVideoUrl}` : ""}
            </p>
            <form action={deleteShowreel}>
              <input type="hidden" name="id" value={item.id} />
              <button className="rounded-full border border-rose-500/50 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/10">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
