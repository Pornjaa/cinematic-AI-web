import type { Metadata } from "next";
import { toAbsoluteUrl } from "@/lib/base-url";

export function siteMetadata({
  title,
  description,
  path,
  noindex
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const url = toAbsoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Cinematic AI",
      locale: "th_TH",
      type: "website"
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } }
  };
}
