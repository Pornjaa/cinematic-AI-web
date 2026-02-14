import Link from "next/link";
import { getLocale } from "@/lib/i18n";
import { pickLocalized } from "@/lib/content";
import { siteMetadata } from "@/lib/seo";
import { getYouTubeEmbedUrl, isDirectVideoFile } from "@/lib/video";
import { getCachedTutorials } from "@/lib/public-data";

export const metadata = siteMetadata({
  title: "Free Tutorials",
  description: "คลิปสอนฟรี",
  path: "/free-tutorials"
});

export default async function FreeTutorialsPage() {
  const locale = await getLocale();
  const tutorials = await getCachedTutorials();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Free tutorial</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {tutorials.map((tutorial) => {
          const videoUrl = tutorial.muxPlaybackId
            ? `https://stream.mux.com/${tutorial.muxPlaybackId}.m3u8`
            : tutorial.externalVideoUrl || (/^https?:\/\//i.test(tutorial.slug) ? tutorial.slug : "");
          const youtubeEmbed = getYouTubeEmbedUrl(videoUrl);

          return (
            <article key={tutorial.id} className="rounded-3xl cinematic-card p-5">
              {youtubeEmbed ? (
                <iframe
                  src={youtubeEmbed}
                  title={pickLocalized(locale, tutorial.titleTh, tutorial.titleEn)}
                  className="mb-4 aspect-video w-full rounded-2xl border border-white/10"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videoUrl && isDirectVideoFile(videoUrl) ? (
                <video controls src={videoUrl} className="mb-4 aspect-video w-full rounded-2xl border border-white/10 bg-black" />
              ) : tutorial.thumbnailUrl ? (
                <img
                  src={tutorial.thumbnailUrl}
                  alt={pickLocalized(locale, tutorial.titleTh, tutorial.titleEn)}
                  className="mb-4 aspect-video w-full rounded-2xl border border-white/10 object-cover"
                />
              ) : null}
              <h2 className="font-semibold">{pickLocalized(locale, tutorial.titleTh, tutorial.titleEn)}</h2>
              <p className="text-zinc-300">{pickLocalized(locale, tutorial.descriptionTh, tutorial.descriptionEn)}</p>
              <Link href={`/free-tutorials/${tutorial.slug}`} className="mt-3 inline-flex text-sm text-brand-500">
                ดูหน้าเต็ม
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
