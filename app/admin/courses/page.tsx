import Link from "next/link";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CoursePricingFields } from "@/components/admin/course-pricing-fields";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function createUniqueCourseSlug(raw: string) {
  const base = slugify(raw) || `course-${Date.now()}`;
  let candidate = base;
  let counter = 1;

  while (await db.course.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}

async function createCourse(formData: FormData) {
  "use server";
  const videoEnabled = formData.get("videoEnabled") === "on";
  const liveEnabled = formData.get("liveEnabled") === "on";
  const videoPriceTHB = videoEnabled ? Number(formData.get("videoPriceTHB") || 990) : null;
  const livePriceTHB = liveEnabled ? Number(formData.get("livePriceTHB") || 3000) : null;
  const fallbackPrice = videoPriceTHB ?? livePriceTHB ?? Number(formData.get("priceTHB") || 0);
  const titleTh = String(formData.get("titleTh") || "");
  const titleEn = String(formData.get("titleEn") || "");
  const rawSlug = String(formData.get("slug") || "");
  const slug = await createUniqueCourseSlug(rawSlug || titleEn || titleTh || "course");

  await db.course.create({
    data: {
      slug,
      titleTh,
      titleEn,
      descriptionTh: String(formData.get("descriptionTh") || ""),
      descriptionEn: String(formData.get("descriptionEn") || ""),
      contentTh: String(formData.get("contentTh") || ""),
      contentEn: String(formData.get("contentEn") || ""),
      coverImageUrl: String(formData.get("coverImageUrl") || ""),
      priceTHB: fallbackPrice,
      videoEnabled,
      videoPriceTHB,
      liveEnabled,
      livePriceTHB,
      status: String(formData.get("status") || "DRAFT") as "DRAFT" | "PUBLISHED" | "SCHEDULED",
      position: Number(formData.get("position") || 0),
      publishedAt: formData.get("publishedAt") ? new Date(String(formData.get("publishedAt"))) : null
    }
  });
  revalidatePath("/courses");
  revalidatePath("/admin/courses");
}

async function deleteCourse(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;

  await db.course.delete({ where: { id } });
  revalidatePath("/courses");
  revalidatePath("/admin/courses");
}

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Manage Courses</h1>
      <form action={createCourse} className="grid gap-2 rounded-3xl cinematic-card p-5 md:grid-cols-2">
        <input name="slug" placeholder="slug (เว้นว่างได้ ระบบสร้างให้อัตโนมัติ)" className="rounded-xl border border-white/15 p-2" />
        <input name="coverImageUrl" placeholder="cover image url" className="rounded-xl border border-white/15 p-2" />
        <input name="titleTh" placeholder="title th" className="rounded-xl border border-white/15 p-2" required />
        <input name="titleEn" placeholder="title en" className="rounded-xl border border-white/15 p-2" required />
        <textarea name="descriptionTh" placeholder="คำบรรยายคอร์ส TH" className="rounded-xl border border-white/15 p-2" />
        <textarea name="descriptionEn" placeholder="Course summary EN" className="rounded-xl border border-white/15 p-2" />
        <textarea name="contentTh" placeholder="เนื้อหาคอร์สฉบับเต็ม TH" className="rounded-xl border border-white/15 p-2 md:col-span-2" rows={5} />
        <textarea name="contentEn" placeholder="Full course content EN" className="rounded-xl border border-white/15 p-2 md:col-span-2" rows={5} />
        <input name="priceTHB" type="number" placeholder="ราคา fallback (ใช้เมื่อไม่เปิด mode)" className="rounded-xl border border-white/15 p-2" defaultValue={990} />
        <CoursePricingFields />
        <input name="position" type="number" placeholder="position" className="rounded-xl border border-white/15 p-2" defaultValue={courses.length + 1} />
        <input name="publishedAt" type="datetime-local" className="rounded-xl border border-white/15 p-2" />
        <select name="status" className="rounded-xl border border-white/15 p-2">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
        </select>
        <button className="rounded-xl bg-brand-700 px-4 py-2 text-white md:col-span-2">Save course</button>
      </form>

      <div className="space-y-2">
        {courses.map((course) => (
          <div key={course.id} className="flex items-center justify-between rounded-2xl cinematic-card p-4 text-sm">
            <span>
              {course.titleTh} ({course.status}) {course.videoEnabled ? `| คลิป ${course.videoPriceTHB ?? "-"} THB` : "| ไม่มีแบบคลิป"}{" "}
              {course.liveEnabled ? `| Live ${course.livePriceTHB ?? "-"} THB` : "| ไม่มีแบบสด"}
            </span>
            <div className="flex items-center gap-3">
              <Link href={`/admin/courses/${course.id}/edit`} className="text-brand-500">
                Edit details
              </Link>
              <Link href={`/admin/courses/${course.id}`} className="text-brand-700">
                Manage Curriculum
              </Link>
              <form action={deleteCourse}>
                <input type="hidden" name="id" value={course.id} />
                <button className="rounded-full border border-rose-500/50 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/10">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
