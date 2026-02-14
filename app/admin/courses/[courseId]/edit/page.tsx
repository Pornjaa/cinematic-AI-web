import Link from "next/link";
import { notFound } from "next/navigation";
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

async function createUniqueCourseSlug(raw: string, currentId: string) {
  const base = slugify(raw) || `course-${Date.now()}`;
  let candidate = base;
  let counter = 1;

  while (
    await db.course.findFirst({
      where: { slug: candidate, NOT: { id: currentId } },
      select: { id: true }
    })
  ) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}

async function updateCourse(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;

  const existing = await db.course.findUnique({ where: { id } });
  if (!existing) return;

  const videoEnabled = formData.get("videoEnabled") === "on";
  const liveEnabled = formData.get("liveEnabled") === "on";
  const videoPriceTHB = videoEnabled ? Number(formData.get("videoPriceTHB") || 990) : null;
  const livePriceTHB = liveEnabled ? Number(formData.get("livePriceTHB") || 3000) : null;
  const fallbackPrice = videoPriceTHB ?? livePriceTHB ?? Number(formData.get("priceTHB") || existing.priceTHB || 0);

  const titleTh = String(formData.get("titleTh") || "").trim();
  const titleEn = String(formData.get("titleEn") || "").trim();
  const rawSlug = String(formData.get("slug") || "").trim();
  const slug = await createUniqueCourseSlug(rawSlug || titleEn || titleTh || existing.slug, id);

  await db.course.update({
    where: { id },
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
      status: String(formData.get("status") || existing.status) as "DRAFT" | "PUBLISHED" | "SCHEDULED",
      position: Number(formData.get("position") || existing.position),
      publishedAt: formData.get("publishedAt") ? new Date(String(formData.get("publishedAt"))) : null
    }
  });

  revalidatePath("/courses");
  revalidatePath(`/courses/${existing.slug}`);
  revalidatePath(`/courses/${slug}`);
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}/edit`);
}

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) notFound();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <Link href="/admin/courses" className="text-sm text-brand-500">
          ← Back to courses
        </Link>
      </div>

      <form action={updateCourse} className="grid gap-2 rounded-3xl cinematic-card p-5 md:grid-cols-2">
        <input type="hidden" name="id" value={course.id} />
        <input name="slug" defaultValue={course.slug} placeholder="slug (เว้นว่างได้ ระบบสร้างให้อัตโนมัติ)" className="rounded-xl border border-white/15 p-2" />
        <input name="coverImageUrl" defaultValue={course.coverImageUrl ?? ""} placeholder="cover image url" className="rounded-xl border border-white/15 p-2" />
        <input name="titleTh" defaultValue={course.titleTh} placeholder="title th" className="rounded-xl border border-white/15 p-2" required />
        <input name="titleEn" defaultValue={course.titleEn} placeholder="title en" className="rounded-xl border border-white/15 p-2" required />
        <textarea name="descriptionTh" defaultValue={course.descriptionTh} placeholder="คำบรรยายคอร์ส TH" className="rounded-xl border border-white/15 p-2" />
        <textarea name="descriptionEn" defaultValue={course.descriptionEn} placeholder="Course summary EN" className="rounded-xl border border-white/15 p-2" />
        <textarea
          name="contentTh"
          defaultValue={course.contentTh ?? ""}
          placeholder="เนื้อหาคอร์สฉบับเต็ม TH"
          className="rounded-xl border border-white/15 p-2 md:col-span-2"
          rows={5}
        />
        <textarea
          name="contentEn"
          defaultValue={course.contentEn ?? ""}
          placeholder="Full course content EN"
          className="rounded-xl border border-white/15 p-2 md:col-span-2"
          rows={5}
        />
        <input name="priceTHB" type="number" defaultValue={course.priceTHB} placeholder="ราคา fallback" className="rounded-xl border border-white/15 p-2" />

        <CoursePricingFields
          defaultVideoEnabled={course.videoEnabled}
          defaultVideoPrice={course.videoPriceTHB}
          defaultLiveEnabled={course.liveEnabled}
          defaultLivePrice={course.livePriceTHB}
        />

        <input name="position" type="number" placeholder="position" className="rounded-xl border border-white/15 p-2" defaultValue={course.position} />
        <input
          name="publishedAt"
          type="datetime-local"
          className="rounded-xl border border-white/15 p-2"
          defaultValue={course.publishedAt ? new Date(course.publishedAt.getTime() - course.publishedAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
        />
        <select name="status" className="rounded-xl border border-white/15 p-2" defaultValue={course.status}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
        </select>
        <button className="rounded-xl bg-brand-700 px-4 py-2 text-white md:col-span-2">Save changes</button>
      </form>
    </div>
  );
}
