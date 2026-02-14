import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/rbac";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { pickLocalized } from "@/lib/content";
import { RenderBlocks } from "@/components/blocks/render-blocks";
import { ProgressToggle } from "@/components/shared/progress-toggle";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Learn",
  description: "Learning area",
  path: "/learn",
  noindex: true
});

export default async function LearnPage({
  params,
  searchParams
}: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  const session = await requireAuth();
  const locale = await getLocale();
  const { courseSlug } = await params;
  const { lesson: lessonId } = await searchParams;

  const course = await db.course.findUnique({
    where: { slug: courseSlug },
    include: {
      sections: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" }
          }
        }
      }
    }
  });

  if (!course) notFound();

  const enrolled = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } }
  });
  if (!enrolled && session.user.role !== "ADMIN") redirect("/courses");

  const lessons = course.sections.flatMap((section) => section.lessons.map((lesson) => ({ ...lesson, section })));
  if (lessons.length === 0) {
    return <p>ยังไม่มีบทเรียน</p>;
  }

  const current = lessons.find((lesson) => lesson.id === lessonId) ?? lessons[0];
  const currentWithBlocks = await db.lesson.findUnique({
    where: { id: current.id },
    include: {
      blocks: { orderBy: { position: "asc" } },
      progress: session.user.role === "ADMIN" ? false : { where: { userId: session.user.id } }
    }
  });
  if (!currentWithBlocks) {
    return <p>ยังไม่พบเนื้อหาบทเรียน</p>;
  }
  const index = lessons.findIndex((lesson) => lesson.id === current.id);
  const prev = lessons[index - 1];
  const next = lessons[index + 1];

  return (
    <div className="grid gap-6 md:grid-cols-[280px,1fr]">
      <aside className="space-y-3 rounded-3xl cinematic-card p-4">
        <h2 className="font-semibold">Curriculum</h2>
        {course.sections.map((section) => (
          <div key={section.id} className="space-y-1">
            <p className="text-sm font-medium">{pickLocalized(locale, section.titleTh, section.titleEn)}</p>
            {section.lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/learn/${course.slug}?lesson=${lesson.id}`}
                scroll={false}
                className={`block rounded-lg px-2 py-1 text-sm ${lesson.id === current.id ? "bg-brand-50 text-brand-900" : "text-zinc-300"}`}
              >
                {pickLocalized(locale, lesson.titleTh, lesson.titleEn)}
              </Link>
            ))}
          </div>
        ))}
      </aside>
      <article className="space-y-4 rounded-3xl cinematic-card p-6">
        <h1 className="text-2xl font-semibold">{pickLocalized(locale, currentWithBlocks.titleTh, currentWithBlocks.titleEn)}</h1>
        <p className="text-zinc-300">{pickLocalized(locale, currentWithBlocks.descriptionTh, currentWithBlocks.descriptionEn)}</p>
        <RenderBlocks blocks={currentWithBlocks.blocks} locale={locale} />
        <ProgressToggle
          lessonId={currentWithBlocks.id}
          initialCompleted={Boolean(currentWithBlocks.progress?.[0]?.completed)}
        />
        <div className="flex justify-between text-sm">
          {prev ? <Link href={`/learn/${course.slug}?lesson=${prev.id}`} scroll={false}>← Prev</Link> : <span />}
          {next ? <Link href={`/learn/${course.slug}?lesson=${next.id}`} scroll={false}>Next →</Link> : <span />}
        </div>
      </article>
    </div>
  );
}
