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

async function createArticle(formData: FormData) {
  "use server";
  const rawSlug = String(formData.get("slug") || "").trim();
  const titleTh = String(formData.get("titleTh") || "").trim();
  const titleEn = String(formData.get("titleEn") || "").trim();
  const safeSlug = rawSlug || `${slugify(titleEn || titleTh || "article")}-${Date.now()}`;

  await db.article.create({
    data: {
      slug: safeSlug,
      titleTh,
      titleEn,
      excerptTh: String(formData.get("excerptTh") || ""),
      excerptEn: String(formData.get("excerptEn") || ""),
      contentMdTh: String(formData.get("contentMdTh") || ""),
      contentMdEn: String(formData.get("contentMdEn") || ""),
      coverImageUrl: String(formData.get("coverImageUrl") || ""),
      status: String(formData.get("status") || "DRAFT") as "DRAFT" | "PUBLISHED" | "SCHEDULED",
      publishedAt: formData.get("publishedAt") ? new Date(String(formData.get("publishedAt"))) : null
    }
  });
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
}

async function deleteArticle(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;

  await db.article.delete({ where: { id } });
  revalidatePath("/articles");
  revalidatePath("/admin/articles");
}

export default async function AdminArticlesPage() {
  const articles = await db.article.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Manage Articles</h1>
      <form action={createArticle} className="space-y-2 rounded-3xl cinematic-card p-5">
        <div className="grid gap-2 md:grid-cols-2">
          <input name="slug" placeholder="slug (optional)" className="rounded-xl border border-white/15 p-2" />
          <input name="coverImageUrl" placeholder="cover image url" className="rounded-xl border border-white/15 p-2" />
          <input name="titleTh" placeholder="title th" className="rounded-xl border border-white/15 p-2" required />
          <input name="titleEn" placeholder="title en" className="rounded-xl border border-white/15 p-2" required />
          <input name="excerptTh" placeholder="excerpt th" className="rounded-xl border border-white/15 p-2" />
          <input name="excerptEn" placeholder="excerpt en" className="rounded-xl border border-white/15 p-2" />
        </div>
        <textarea name="contentMdTh" placeholder="markdown th" rows={6} className="w-full rounded-xl border border-white/15 p-2" />
        <textarea name="contentMdEn" placeholder="markdown en" rows={6} className="w-full rounded-xl border border-white/15 p-2" />
        <div className="grid gap-2 md:grid-cols-2">
          <input name="publishedAt" type="datetime-local" className="rounded-xl border border-white/15 p-2" />
          <select name="status" className="rounded-xl border border-white/15 p-2">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="SCHEDULED">Scheduled</option>
          </select>
        </div>
        <button className="rounded-xl bg-brand-700 px-4 py-2 text-white">Save article</button>
      </form>

      <div className="space-y-2">
        {articles.map((article) => (
          <div key={article.id} className="flex items-center justify-between gap-3 rounded-2xl cinematic-card p-4 text-sm">
            <p>{article.titleTh} ({article.slug}) - {article.status}</p>
            <div className="flex items-center gap-3">
              <Link href={`/admin/articles/${article.id}/edit`} className="text-brand-500">
                Edit
              </Link>
              <form action={deleteArticle}>
                <input type="hidden" name="id" value={article.id} />
                <button className="rounded-full border border-rose-500/50 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/10">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
