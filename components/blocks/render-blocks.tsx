import { pickLocalized } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { extractMuxPlaybackId, normalizeMuxVideoUrl } from "@/lib/video";
import { MarkdownClient } from "@/components/shared/markdown-client";

type Block = {
  id: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "EMBED" | "MARKDOWN";
  textTh: string | null;
  textEn: string | null;
  markdownTh: string | null;
  markdownEn: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  embedUrl: string | null;
};

export function RenderBlocks({ blocks, locale }: { blocks: Block[]; locale: Locale }) {
  return (
    <div className="space-y-5">
      {blocks.map((block) => {
        const videoSrc = block.videoUrl?.trim();
        const embedSrc = block.embedUrl?.trim();
        const imageSrc = block.imageUrl?.trim();
        const normalizedVideoSrc = normalizeMuxVideoUrl(videoSrc) ?? videoSrc;
        const muxPlaybackId = extractMuxPlaybackId(videoSrc);
        const muxPlayerUrl =
          videoSrc && videoSrc.includes("player.mux.com")
            ? videoSrc
            : muxPlaybackId
              ? `https://player.mux.com/${muxPlaybackId}`
              : null;

        if (block.type === "TEXT") {
          return <p key={block.id}>{pickLocalized(locale, block.textTh, block.textEn)}</p>;
        }
        if (block.type === "MARKDOWN") {
          return (
            <MarkdownClient
              key={block.id}
              markdown={pickLocalized(locale, block.markdownTh, block.markdownEn)}
            />
          );
        }
        if (block.type === "IMAGE" && imageSrc) {
          return <img key={block.id} src={imageSrc} alt="block" className="rounded-xl" />;
        }
        if (block.type === "VIDEO" && normalizedVideoSrc) {
          return (
            <div key={block.id} className="space-y-2">
              {muxPlayerUrl ? (
                <iframe
                  src={muxPlayerUrl}
                  className="aspect-video w-full rounded-xl border border-white/10"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Mux video"
                />
              ) : (
                <video controls preload="metadata" className="w-full rounded-xl">
                  <source src={normalizedVideoSrc} type="video/mp4" />
                </video>
              )}
              <a
                href={normalizedVideoSrc}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-400 underline"
              >
                Open video source
              </a>
            </div>
          );
        }
        if (block.type === "EMBED" && embedSrc) {
          return (
            <iframe
              key={block.id}
              src={embedSrc}
              className="h-80 w-full rounded-xl"
              title="embed"
              allowFullScreen
            />
          );
        }
        return null;
      })}
    </div>
  );
}
