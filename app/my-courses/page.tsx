import Link from "next/link";
import { requireAuth } from "@/lib/rbac";
import { db } from "@/lib/db";
import { getLocale } from "@/lib/i18n";
import { pickLocalized } from "@/lib/content";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "My Courses",
  description: "Courses you enrolled",
  path: "/my-courses",
  noindex: true
});

export default async function MyCoursesPage() {
  const session = await requireAuth();
  const locale = await getLocale();
  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">คอร์สของคุณ</h1>
      {enrollments.length === 0 && <p>ยังไม่มีคอร์สที่ซื้อ</p>}
      {enrollments.map((item) => (
        <Link key={item.id} href={`/learn/${item.course.slug}`} className="block rounded-3xl cinematic-card p-5">
          <h2 className="font-semibold">{pickLocalized(locale, item.course.titleTh, item.course.titleEn)}</h2>
          <p className="text-sm text-zinc-300">{pickLocalized(locale, item.course.descriptionTh, item.course.descriptionEn)}</p>
        </Link>
      ))}
    </div>
  );
}
