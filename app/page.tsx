import Link from "next/link";
import { Facebook, Music2, Youtube } from "lucide-react";
import { getLocale, t } from "@/lib/i18n";
import { pickLocalized } from "@/lib/content";
import { FAQJsonLd } from "@/components/jsonld/faq-jsonld";
import { siteMetadata } from "@/lib/seo";
import { HeroCarousel } from "@/components/shared/hero-carousel";
import { getYouTubeEmbedUrl, isDirectVideoFile } from "@/lib/video";
import { getCachedFaqs, getCachedFooterSetting, getCachedHeroSlides, getCachedHomeCopy, getCachedOnsiteHighlights, getCachedShowreels } from "@/lib/public-data";

export const metadata = siteMetadata({
  title: "Cinematic AI | Home",
  description: "เรียนทำวิดีโอ cinematic ด้วยคอร์สและบทความคุณภาพ",
  path: "/"
});

export default async function HomePage() {
  const locale = await getLocale();
  const slides = await getCachedHeroSlides();
  const faqs = await getCachedFaqs();
  const homeCopy = await getCachedHomeCopy();
  const setting = await getCachedFooterSetting().catch(() => null);
  const showreels = (await getCachedShowreels()).slice(0, 2);
  const onsiteHighlights = await getCachedOnsiteHighlights();
  const validSlides = slides.filter((slide) => Boolean(slide.imageUrl));
  const latestShowreel = showreels[0];
  const heroTagline = pickLocalized(locale, homeCopy.taglineTh, homeCopy.taglineEn) || "Release your cinematic vision";
  const heroDescription =
    "ปลดล็อกศักยภาพการสร้างภาพยนตร์ระดับฮอลลีวูดด้วยพลังแห่ง AI เปลี่ยนจินตนาการให้กลายเป็นจริงผ่านสื่อภาพยนตร์ได้ง่ายๆ ด้วยปลายนิ้ว ที่ Cinematic AI ทุกไอเดียเป็นจริงได้";

  return (
    <div className="space-y-12">
      <section className="-mx-4 overflow-hidden md:-mx-8">
        <HeroCarousel
          slides={validSlides.map((slide) => ({
            id: slide.id,
            imageUrl: slide.imageUrl,
            title: pickLocalized(locale, slide.titleTh, slide.titleEn),
            subtitle: pickLocalized(locale, slide.subtitleTh, slide.subtitleEn)
          }))}
          tagline={heroTagline}
          description={heroDescription}
          facebookUrl={setting?.facebookUrl}
        />
      </section>

      <section className="px-2 md:px-0">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Showreel</h2>
          <div className="flex items-center gap-3 text-sm">
            {latestShowreel && (
              <Link href={`/showreel/${latestShowreel.slug}`} className="rounded-full bg-brand-700 px-4 py-2 text-white">
                ดูคลิปล่าสุด
              </Link>
            )}
            <Link href="/showreel" className="text-brand-500">
              ดูทั้งหมด
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {showreels.map((item) => (
            <article key={item.id} className="rounded-3xl cinematic-card p-5">
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
              <h3 className="font-semibold">{pickLocalized(locale, item.titleTh, item.titleEn)}</h3>
              <p className="text-zinc-300">{pickLocalized(locale, item.descriptionTh, item.descriptionEn)}</p>
              <Link href={`/showreel/${item.slug}`} className="mt-3 inline-flex text-sm text-brand-500">
                ดูรายละเอียดคลิป
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl cinematic-card p-6">
        <h2 className="mb-4 text-2xl font-semibold">บรรยากาศคอร์สสอนสด onsite</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {onsiteHighlights.map((item) => (
            <article key={item.id} className="rounded-3xl border border-white/10 bg-black/30 p-5">
              {(() => {
                const youtubeEmbed = getYouTubeEmbedUrl(item.externalVideoUrl || "");
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

                if (item.externalVideoUrl && isDirectVideoFile(item.externalVideoUrl)) {
                  return <video controls src={item.externalVideoUrl} className="mb-4 aspect-video w-full rounded-2xl border border-white/10 bg-black" />;
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
              <h3 className="font-semibold">{pickLocalized(locale, item.titleTh, item.titleEn)}</h3>
              <p className="text-zinc-300">{pickLocalized(locale, item.descriptionTh, item.descriptionEn)}</p>
            </article>
          ))}
          {onsiteHighlights.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/20 bg-black/20 p-5 text-sm text-zinc-300 md:col-span-2">
              ยังไม่มีข้อมูลบรรยากาศคอร์สสอนสด onsite (เพิ่มได้ที่ Admin &gt; Home)
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4 px-2 md:px-0">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <FAQJsonLd
          faqs={faqs.map((faq) => ({
            question: t({ th: faq.questionTh, en: faq.questionEn }, locale),
            answer: t({ th: faq.answerTh, en: faq.answerEn }, locale)
          }))}
        />
        {faqs.map((faq) => (
          <div key={faq.id} className="rounded-3xl cinematic-card p-5">
            <p className="font-semibold">{t({ th: faq.questionTh, en: faq.questionEn }, locale)}</p>
            <p className="mt-1 text-zinc-300">{t({ th: faq.answerTh, en: faq.answerEn }, locale)}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl cinematic-card p-6">
        <h2 className="text-xl font-semibold">Contact us</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {setting?.facebookUrl ? (
            <a href={setting.facebookUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
              <Facebook size={16} />
              Facebook
            </a>
          ) : null}
          {setting?.tiktokUrl ? (
            <a href={setting.tiktokUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
              <Music2 size={16} />
              TikTok
            </a>
          ) : null}
          {setting?.youtubeUrl ? (
            <a href={setting.youtubeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">
              <Youtube size={16} />
              YouTube
            </a>
          ) : null}
        </div>
        {!setting?.facebookUrl && !setting?.tiktokUrl && !setting?.youtubeUrl ? (
          <p className="mt-3 text-sm text-zinc-400">ยังไม่พบลิงก์ใน Admin &gt; Settings</p>
        ) : null}
      </section>
    </div>
  );
}
