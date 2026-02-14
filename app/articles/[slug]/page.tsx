import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pickLocalized } from "@/lib/content";
import { getLocale } from "@/lib/i18n";
import { ArticleJsonLd } from "@/components/jsonld/article-jsonld";
import { CommentList } from "@/components/shared/comment-list";
import { RenderBlocks } from "@/components/blocks/render-blocks";
import { MarkdownClient } from "@/components/shared/markdown-client";
import { siteMetadata } from "@/lib/seo";
import { toAbsoluteUrl } from "@/lib/base-url";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await db.article.findUnique({ where: { slug } });
  if (!article) return {};

  return siteMetadata({
    title: article.titleTh,
    description: article.excerptTh ?? article.excerptEn ?? "",
    path: `/articles/${slug}`
  });
}

export default async function ArticleDetail({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getLocale();
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug },
    include: { blocks: { orderBy: { position: "asc" } } }
  });

  if (!article || article.status !== "PUBLISHED") notFound();

  const title = pickLocalized(locale, article.titleTh, article.titleEn);
  const excerpt = pickLocalized(locale, article.excerptTh, article.excerptEn);
  const markdown = pickLocalized(locale, article.contentMdTh, article.contentMdEn);

  return (
    <article className="space-y-6">
      <ArticleJsonLd
        title={title}
        description={excerpt}
        url={toAbsoluteUrl(`/articles/${slug}`)}
        image={article.coverImageUrl ?? undefined}
        publishedAt={article.publishedAt}
      />
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-zinc-300">{excerpt}</p>
      {markdown && <MarkdownClient markdown={markdown} />}
      <RenderBlocks blocks={article.blocks} locale={locale} />
      <CommentList articleId={article.id} />
    </article>
  );
}
