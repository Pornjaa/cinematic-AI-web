import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pickLocalized } from "@/lib/content";
import { getLocale } from "@/lib/i18n";
import { CourseJsonLd } from "@/components/jsonld/course-jsonld";
import { CoursePurchasePanel } from "@/components/shared/course-purchase-panel";
import { siteMetadata } from "@/lib/seo";
import { auth } from "@/auth";
import { toAbsoluteUrl } from "@/lib/base-url";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await db.course.findUnique({ where: { slug } });
  if (!course) return {};
  return siteMetadata({
    title: course.titleTh,
    description: course.descriptionTh,
    path: `/courses/${slug}`
  });
}

export default async function CourseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const [course, siteSetting, session] = await Promise.all([
    db.course.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { position: "asc" },
          include: { lessons: { orderBy: { position: "asc" } } }
        }
      }
    }),
    db.siteSetting.findFirst(),
    auth()
  ]);
  if (!course || course.status !== "PUBLISHED") notFound();
  const isAdmin = session?.user?.role === "ADMIN";

  const title = pickLocalized(locale, course.titleTh, course.titleEn);
  const description = pickLocalized(locale, course.descriptionTh, course.descriptionEn);
  const content = pickLocalized(locale, course.contentTh, course.contentEn);
  const options = [
    course.videoEnabled && course.videoPriceTHB
      ? {
          mode: "VIDEO" as const,
          label: locale === "th" ? "เรียนผ่านคลิป" : "Video lessons",
          priceTHB: course.videoPriceTHB
        }
      : null,
    course.liveEnabled && course.livePriceTHB
      ? {
          mode: "LIVE" as const,
          label: locale === "th" ? "สอนสดตัวต่อตัวออนไลน์" : "1:1 live online",
          priceTHB: course.livePriceTHB
        }
      : null
  ].filter((value): value is { mode: "VIDEO" | "LIVE"; label: string; priceTHB: number } => Boolean(value));
  const minPrice = options.length > 0 ? Math.min(...options.map((opt) => opt.priceTHB)) : course.priceTHB;
  const bankInfo =
    siteSetting?.bankAccountNumber && (siteSetting?.bankNameTh || siteSetting?.bankNameEn)
      ? {
          bankName: pickLocalized(locale, siteSetting.bankNameTh, siteSetting.bankNameEn),
          accountName: pickLocalized(locale, siteSetting.bankAccountNameTh, siteSetting.bankAccountNameEn),
          accountNumber: siteSetting.bankAccountNumber,
          transferNote: pickLocalized(locale, siteSetting.bankTransferNoteTh, siteSetting.bankTransferNoteEn)
        }
      : null;

  return (
    <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
      <article className="space-y-4">
        <CourseJsonLd name={title} description={description} price={minPrice} url={toAbsoluteUrl(`/courses/${slug}`)} />
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-zinc-200">{description}</p>
        {content && (
          <section className="rounded-3xl cinematic-card p-5">
            <h2 className="mb-2 text-lg font-semibold">เนื้อหาคอร์ส</h2>
            <p className="whitespace-pre-wrap text-zinc-200">{content}</p>
          </section>
        )}
        <section className="space-y-3 rounded-3xl cinematic-card p-5">
          <h2 className="text-lg font-semibold">Curriculum</h2>
          {course.sections.map((section) => (
            <div key={section.id}>
              <h3 className="font-medium">{pickLocalized(locale, section.titleTh, section.titleEn)}</h3>
              <ul className="ml-5 list-disc text-sm text-zinc-300">
                {section.lessons.map((lesson) => (
                  <li key={lesson.id}>{pickLocalized(locale, lesson.titleTh, lesson.titleEn)}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </article>
      <aside className="sticky top-20 space-y-3 rounded-3xl cinematic-card p-5">
        {isAdmin ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-300">โหมดแอดมิน: เข้าเรียนได้ทันที</p>
            <a
              href={`/learn/${course.slug}`}
              className="inline-flex w-full items-center justify-center rounded-xl bg-brand-700 px-4 py-2 text-white"
            >
              เข้าเรียนตอนนี้
            </a>
          </div>
        ) : (
          <CoursePurchasePanel courseId={course.id} options={options} bankInfo={bankInfo} />
        )}
      </aside>
    </div>
  );
}
