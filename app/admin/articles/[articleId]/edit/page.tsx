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

export default async function EditArticlePage({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = await params;
  const article = await db.article.findUnique({ where: { id: articleId } });
  if (!article) notFound();

  async function updateArticle(formData: FormData) {
    "use server";
    const rawSlug = String(formData.get("slug") || "").trim();
    const titleTh = String(formData.get("titleTh") || "").trim();
    const titleEn = String(formData.get("titleEn") || "").trim();
    const safeSlug = rawSlug || `${slugify(titleEn || titleTh || "article")}-${Date.now()}`;

    await db.article.update({
      where: { id: articleId },
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
    revalidatePath(`/articles/${safeSlug}`);
    revalidatePath("/admin/articles");
  }

  const dateValue = article.publishedAt
    ? new Date(article.publishedAt.getTime() - article.publishedAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    : "";

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Edit Article</h1>
      <form action={updateArticle} className="space-y-2 rounded-3xl cinematic-card p-5">
        <div className="grid gap-2 md:grid-cols-2">
          <input name="slug" placeholder="slug (optional)" className="rounded-xl border border-white/15 p-2" defaultValue={article.slug} />
          <input name="coverImageUrl" placeholder="cover image url" className="rounded-xl border border-white/15 p-2" defaultValue={article.coverImageUrl ?? ""} />
          <input name="titleTh" placeholder="title th" className="rounded-xl border border-white/15 p-2" defaultValue={article.titleTh} required />
          <input name="titleEn" placeholder="title en" className="rounded-xl border border-white/15 p-2" defaultValue={article.titleEn} required />
          <input name="excerptTh" placeholder="excerpt th" className="rounded-xl border border-white/15 p-2" defaultValue={article.excerptTh ?? ""} />
          <input name="excerptEn" placeholder="excerpt en" className="rounded-xl border border-white/15 p-2" defaultValue={article.excerptEn ?? ""} />
        </div>
        <textarea name="contentMdTh" placeholder="markdown th" rows={8} className="w-full rounded-xl border border-white/15 p-2" defaultValue={article.contentMdTh ?? ""} />
        <textarea name="contentMdEn" placeholder="markdown en" rows={8} className="w-full rounded-xl border border-white/15 p-2" defaultValue={article.contentMdEn ?? ""} />
        <div className="grid gap-2 md:grid-cols-2">
          <input name="publishedAt" type="datetime-local" className="rounded-xl border border-white/15 p-2" defaultValue={dateValue} />
          <select name="status" className="rounded-xl border border-white/15 p-2" defaultValue={article.status}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="SCHEDULED">Scheduled</option>
          </select>
        </div>
        <button className="rounded-xl bg-brand-700 px-4 py-2 text-white">Save changes</button>
      </form>
    </div>
  );
}
