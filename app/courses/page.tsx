import Link from "next/link";
import { getLocale } from "@/lib/i18n";
import { pickLocalized } from "@/lib/content";
import { siteMetadata } from "@/lib/seo";
import { getCachedCourses } from "@/lib/public-data";

export const metadata = siteMetadata({
  title: "Courses",
  description: "คอร์สที่เปิดสอนทั้งหมด",
  path: "/courses"
});

export default async function CoursesPage() {
  const locale = await getLocale();
  const courses = await getCachedCourses();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">คอร์สที่เปิดสอน</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.slug}`} className="rounded-3xl cinematic-card p-5">
            {course.coverImageUrl && (
              <img
                src={course.coverImageUrl}
                alt={pickLocalized(locale, course.titleTh, course.titleEn)}
                className="mb-4 aspect-video w-full rounded-2xl border border-white/10 object-cover"
              />
            )}
            <h2 className="font-semibold">{pickLocalized(locale, course.titleTh, course.titleEn)}</h2>
            <p className="text-zinc-300">{pickLocalized(locale, course.descriptionTh, course.descriptionEn)}</p>
            <p className="mt-2 text-brand-500">
              เริ่ม {Math.min(course.videoEnabled && course.videoPriceTHB ? course.videoPriceTHB : Number.MAX_SAFE_INTEGER, course.liveEnabled && course.livePriceTHB ? course.livePriceTHB : Number.MAX_SAFE_INTEGER, course.priceTHB).toLocaleString()} THB
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
