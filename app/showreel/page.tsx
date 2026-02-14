import Link from "next/link";
import { pickLocalized } from "@/lib/content";
import { getLocale } from "@/lib/i18n";
import { siteMetadata } from "@/lib/seo";
import { getYouTubeEmbedUrl, isDirectVideoFile } from "@/lib/video";
import { getCachedShowreels } from "@/lib/public-data";

export const metadata = siteMetadata({
  title: "Showreel",
  description: "รวมผลงานวิดีโอทั้งหมด",
  path: "/showreel"
});

export default async function ShowreelPage() {
  const locale = await getLocale();
  const items = await getCachedShowreels();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Showreel</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-3xl cinematic-card p-5 transition hover:-translate-y-1">
            {(() => {
              const videoUrl = item.muxPlaybackId
                ? `https://stream.mux.com/${item.muxPlaybackId}.m3u8`
                : item.externalVideoUrl || (/^https?:\/\//i.test(item.slug) ? item.slug : "");
              const youtubeEmbed = getYouTubeEmbedUrl(videoUrl);

              if (youtubeEmbed) {
                return (
                  <iframe
                    src={youtubeEmbed}
                    title={pickLocalized(locale, item.titleTh, item.titleEn)}
                    className="mb-4 aspect-video w-full rounded-2xl border border-white/10"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                );
              }

              if (videoUrl && isDirectVideoFile(videoUrl)) {
                return <video controls src={videoUrl} className="mb-4 aspect-video w-full rounded-2xl border border-white/10 bg-black" />;
              }

              if (item.thumbnailUrl) {
                return (
                  <img
                    src={item.thumbnailUrl}
                    alt={pickLocalized(locale, item.titleTh, item.titleEn)}
                    className="mb-4 aspect-video w-full rounded-2xl border border-white/10 object-cover"
                  />
                );
              }

              return null;
            })()}
            <h2 className="font-semibold">{pickLocalized(locale, item.titleTh, item.titleEn)}</h2>
            <p className="text-sm text-zinc-300">{pickLocalized(locale, item.descriptionTh, item.descriptionEn)}</p>
            <Link href={`/showreel/${item.slug}`} className="mt-3 inline-flex text-sm text-brand-500">
              ดูหน้าเต็ม
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
