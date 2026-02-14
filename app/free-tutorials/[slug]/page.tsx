import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { pickLocalized } from "@/lib/content";
import { siteMetadata } from "@/lib/seo";
import { CommentList } from "@/components/shared/comment-list";
import { getYouTubeEmbedUrl, isDirectVideoFile } from "@/lib/video";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tutorial = await db.freeTutorial.findUnique({ where: { slug } });
  if (!tutorial) return {};
  return siteMetadata({
    title: tutorial.titleTh,
    description: tutorial.descriptionTh ?? tutorial.descriptionEn ?? "",
    path: `/free-tutorials/${slug}`
  });
}

export default async function FreeTutorialDetail({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getLocale();
  const { slug } = await params;
  const tutorial = await db.freeTutorial.findUnique({ where: { slug } });

  if (!tutorial || tutorial.status !== "PUBLISHED") notFound();

  const videoUrl = tutorial.muxPlaybackId
    ? `https://stream.mux.com/${tutorial.muxPlaybackId}.m3u8`
    : tutorial.externalVideoUrl;
  const youtubeEmbed = getYouTubeEmbedUrl(videoUrl);

  return (
    <article className="space-y-4">
      <h1 className="text-3xl font-bold">{pickLocalized(locale, tutorial.titleTh, tutorial.titleEn)}</h1>
      <p className="text-zinc-300">{pickLocalized(locale, tutorial.descriptionTh, tutorial.descriptionEn)}</p>
      {youtubeEmbed ? (
        <iframe
          src={youtubeEmbed}
          title={pickLocalized(locale, tutorial.titleTh, tutorial.titleEn)}
          className="aspect-video w-full rounded-2xl"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : videoUrl && isDirectVideoFile(videoUrl) ? (
        <video controls src={videoUrl} className="w-full rounded-2xl" />
      ) : (
        videoUrl && (
          <a href={videoUrl} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-white/30 px-4 py-2 text-sm">
            Open video link
          </a>
        )
      )}
      <CommentList tutorialId={tutorial.id} />
    </article>
  );
}
