import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pickLocalized } from "@/lib/content";
import { getLocale } from "@/lib/i18n";
import { siteMetadata } from "@/lib/seo";
import { getYouTubeEmbedUrl, isDirectVideoFile } from "@/lib/video";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const showreel = await db.showreel.findUnique({ where: { slug } });
  if (!showreel) return {};
  return siteMetadata({
    title: showreel.titleTh,
    description: showreel.descriptionTh ?? showreel.descriptionEn ?? "",
    path: `/showreel/${slug}`
  });
}

export default async function ShowreelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getLocale();
  const { slug } = await params;
  const item = await db.showreel.findUnique({ where: { slug } });
  if (!item || item.status !== "PUBLISHED") notFound();

  const videoUrl = item.muxPlaybackId
    ? `https://stream.mux.com/${item.muxPlaybackId}.m3u8`
    : item.externalVideoUrl || (/^https?:\/\//i.test(item.slug) ? item.slug : "");
  const youtubeEmbed = getYouTubeEmbedUrl(videoUrl);

  return (
    <article className="space-y-4">
      <h1 className="text-3xl font-bold">{pickLocalized(locale, item.titleTh, item.titleEn)}</h1>
      <p className="text-zinc-300">{pickLocalized(locale, item.descriptionTh, item.descriptionEn)}</p>
      {youtubeEmbed ? (
        <iframe
          src={youtubeEmbed}
          title={pickLocalized(locale, item.titleTh, item.titleEn)}
          className="aspect-video w-full rounded-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : videoUrl && isDirectVideoFile(videoUrl) ? (
        <video controls src={videoUrl} className="w-full rounded-2xl bg-black" />
      ) : (
        videoUrl && (
          <a href={videoUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-white/30 px-4 py-2 text-sm">
            Open video link
          </a>
        )
      )}
    </article>
  );
}
