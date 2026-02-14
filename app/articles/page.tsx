import Link from "next/link";
import { getLocale } from "@/lib/i18n";
import { pickLocalized } from "@/lib/content";
import { siteMetadata } from "@/lib/seo";
import { getCachedArticles } from "@/lib/public-data";

export const metadata = siteMetadata({
  title: "Articles",
  description: "บทความความรู้ด้าน cinematic filmmaking",
  path: "/articles"
});

export default async function ArticlesPage() {
  const locale = await getLocale();
  const articles = await getCachedArticles();

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">บทความ</h1>
      {articles.map((article) => (
        <Link key={article.id} href={`/articles/${article.slug}`} className="block rounded-3xl cinematic-card p-5">
          {article.coverImageUrl && (
            <img
              src={article.coverImageUrl}
              alt={pickLocalized(locale, article.titleTh, article.titleEn)}
              className="mb-4 aspect-video w-full rounded-2xl border border-white/10 object-cover"
            />
          )}
          <h2 className="font-semibold">{pickLocalized(locale, article.titleTh, article.titleEn)}</h2>
          <p className="text-sm text-zinc-300">{pickLocalized(locale, article.excerptTh, article.excerptEn)}</p>
        </Link>
      ))}
    </div>
  );
}
