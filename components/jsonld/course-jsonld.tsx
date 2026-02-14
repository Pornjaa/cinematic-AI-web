export function CourseJsonLd({
  name,
  description,
  price,
  url
}: {
  name: string;
  description: string;
  price: number;
  url: string;
}) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: "Cinematic AI"
    },
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "THB",
      url
    }
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />;
}
