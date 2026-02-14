export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  publishedAt
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  publishedAt?: Date | null;
}) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image,
    datePublished: publishedAt?.toISOString(),
    mainEntityOfPage: url
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />;
}
