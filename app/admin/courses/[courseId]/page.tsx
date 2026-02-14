import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CurriculumSorter } from "@/components/admin/curriculum-sorter";
import { MuxVideoUploadField } from "@/components/admin/mux-video-upload-field";
import { normalizeMuxVideoUrl } from "@/lib/video";

async function createSection(formData: FormData) {
  "use server";
  const courseId = String(formData.get("courseId") || "");
  await db.courseSection.create({
    data: {
      courseId,
      titleTh: String(formData.get("titleTh") || ""),
      titleEn: String(formData.get("titleEn") || ""),
      position: Number(formData.get("position") || 1)
    }
  });
  revalidatePath(`/admin/courses/${courseId}`);
}

async function createLesson(formData: FormData) {
  "use server";
  const sectionId = String(formData.get("sectionId") || "");
  const section = await db.courseSection.findUnique({ where: { id: sectionId } });
  if (!section) return;

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const rawSlug = String(formData.get("slug") || "").trim();
  const titleTh = String(formData.get("titleTh") || "");
  const titleEn = String(formData.get("titleEn") || "");
  const base = slugify(rawSlug || titleEn || titleTh || "lesson") || `lesson-${Date.now()}`;

  let uniqueSlug = base;
  let counter = 2;
  while (await db.lesson.findFirst({ where: { sectionId, slug: uniqueSlug } })) {
    uniqueSlug = `${base}-${counter}`;
    counter += 1;
  }

  await db.lesson.create({
    data: {
      sectionId,
      slug: uniqueSlug,
      titleTh,
      titleEn,
      descriptionTh: String(formData.get("descriptionTh") || ""),
      descriptionEn: String(formData.get("descriptionEn") || ""),
      position: Number(formData.get("position") || 1)
    }
  });
  revalidatePath(`/admin/courses/${section.courseId}`);
}

async function createLessonBlock(formData: FormData) {
  "use server";
  const lessonId = String(formData.get("lessonId") || "");
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, include: { section: true } });
  if (!lesson) return;

  const rawVideoUrl = String(formData.get("videoUrl") || "");
  const normalizedVideoUrl = normalizeMuxVideoUrl(rawVideoUrl);

  await db.contentBlock.create({
    data: {
      lessonId,
      type: String(formData.get("type") || "TEXT") as "TEXT" | "IMAGE" | "VIDEO" | "EMBED" | "MARKDOWN",
      textTh: String(formData.get("textTh") || ""),
      textEn: String(formData.get("textEn") || ""),
      markdownTh: String(formData.get("markdownTh") || ""),
      markdownEn: String(formData.get("markdownEn") || ""),
      imageUrl: String(formData.get("imageUrl") || ""),
      videoUrl: normalizedVideoUrl ?? "",
      embedUrl: String(formData.get("embedUrl") || ""),
      position: Number(formData.get("position") || 1)
    }
  });

  revalidatePath(`/admin/courses/${lesson.section.courseId}`);
}

async function updateLessonBlock(formData: FormData) {
  "use server";
  const blockId = String(formData.get("blockId") || "");
  const lessonId = String(formData.get("lessonId") || "");
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, include: { section: true } });
  if (!lesson) return;

  const rawVideoUrl = String(formData.get("videoUrl") || "");
  const normalizedVideoUrl = normalizeMuxVideoUrl(rawVideoUrl);

  await db.contentBlock.update({
    where: { id: blockId },
    data: {
      type: String(formData.get("type") || "TEXT") as "TEXT" | "IMAGE" | "VIDEO" | "EMBED" | "MARKDOWN",
      textTh: String(formData.get("textTh") || ""),
      textEn: String(formData.get("textEn") || ""),
      markdownTh: String(formData.get("markdownTh") || ""),
      markdownEn: String(formData.get("markdownEn") || ""),
      imageUrl: String(formData.get("imageUrl") || ""),
      videoUrl: normalizedVideoUrl ?? "",
      embedUrl: String(formData.get("embedUrl") || ""),
      position: Number(formData.get("position") || 1)
    }
  });

  revalidatePath(`/admin/courses/${lesson.section.courseId}`);
}

async function deleteLessonBlock(formData: FormData) {
  "use server";
  const blockId = String(formData.get("blockId") || "");
  const lessonId = String(formData.get("lessonId") || "");
  const lesson = await db.lesson.findUnique({ where: { id: lessonId }, include: { section: true } });
  if (!lesson) return;

  await db.contentBlock.delete({ where: { id: blockId } });
  revalidatePath(`/admin/courses/${lesson.section.courseId}`);
}

export default async function AdminCourseDetail({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            include: {
              _count: { select: { blocks: true } },
              blocks: {
                orderBy: { position: "asc" },
                take: 50
              }
            }
          }
        }
      }
    }
  });

  if (!course) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{course.titleTh} - Curriculum</h1>

      <form action={createSection} className="grid gap-2 rounded-3xl cinematic-card p-5 md:grid-cols-4">
        <input type="hidden" name="courseId" value={course.id} />
        <input name="titleTh" placeholder="section title th" className="rounded-xl border border-white/15 p-2" required />
        <input name="titleEn" placeholder="section title en" className="rounded-xl border border-white/15 p-2" required />
        <input name="position" type="number" placeholder="position" className="rounded-xl border border-white/15 p-2" defaultValue={course.sections.length + 1} />
        <button className="rounded-xl bg-brand-700 px-4 py-2 text-white">Add section</button>
      </form>

      <CurriculumSorter
        title="Drag to reorder sections"
        target="section"
        items={course.sections.map((section) => ({ id: section.id, label: `${section.position}. ${section.titleTh}` }))}
      />

      <div className="space-y-4">
        {course.sections.map((section) => (
          <div key={section.id} className="space-y-3 rounded-3xl cinematic-card p-5">
            <h2 className="font-semibold">{section.position}. {section.titleTh}</h2>
            <form action={createLesson} className="grid gap-2 md:grid-cols-4">
              <input type="hidden" name="sectionId" value={section.id} />
              <input name="slug" placeholder="lesson slug (optional)" className="rounded-xl border border-white/15 p-2" />
              <input name="titleTh" placeholder="lesson title th" className="rounded-xl border border-white/15 p-2" required />
              <input name="titleEn" placeholder="lesson title en" className="rounded-xl border border-white/15 p-2" required />
              <input name="position" type="number" placeholder="position" className="rounded-xl border border-white/15 p-2" defaultValue={section.lessons.length + 1} />
              <input name="descriptionTh" placeholder="description th" className="rounded-xl border border-white/15 p-2 md:col-span-2" />
              <input name="descriptionEn" placeholder="description en" className="rounded-xl border border-white/15 p-2 md:col-span-2" />
              <button className="rounded-xl bg-brand-700 px-4 py-2 text-white md:col-span-4">Add lesson</button>
            </form>

            <CurriculumSorter
              title="Drag to reorder lessons"
              target="lesson"
              items={section.lessons.map((lesson) => ({ id: lesson.id, label: `${lesson.position}. ${lesson.titleTh}` }))}
            />

            {section.lessons.map((lesson) => (
              <div key={lesson.id} className="rounded-xl border border-white/15 p-4">
                <p className="font-medium">Lesson: {lesson.titleTh}</p>
                <form action={createLessonBlock} className="mt-2 grid gap-2 md:grid-cols-3">
                  <input type="hidden" name="lessonId" value={lesson.id} />
                  <select name="type" className="rounded-xl border border-white/15 p-2">
                    <option value="TEXT">TEXT</option>
                    <option value="MARKDOWN">MARKDOWN</option>
                    <option value="IMAGE">IMAGE</option>
                    <option value="VIDEO">VIDEO</option>
                    <option value="EMBED">EMBED</option>
                  </select>
                  <input name="position" type="number" className="rounded-xl border border-white/15 p-2" defaultValue={lesson._count.blocks + 1} />
                  <input name="textTh" placeholder="text th" className="rounded-xl border border-white/15 p-2" />
                  <input name="textEn" placeholder="text en" className="rounded-xl border border-white/15 p-2" />
                  <input name="markdownTh" placeholder="markdown th" className="rounded-xl border border-white/15 p-2" />
                  <input name="markdownEn" placeholder="markdown en" className="rounded-xl border border-white/15 p-2" />
                  <input name="imageUrl" placeholder="image url" className="rounded-xl border border-white/15 p-2" />
                  <MuxVideoUploadField />
                  <input name="embedUrl" placeholder="embed url" className="rounded-xl border border-white/15 p-2" />
                  <button className="rounded-xl bg-brand-700 px-4 py-2 text-white md:col-span-3">Add block</button>
                </form>

                {lesson.blocks.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {lesson.blocks.map((block) => (
                      <div key={block.id} className="rounded-xl border border-white/10 p-3">
                        <form action={updateLessonBlock} className="grid gap-2 md:grid-cols-3">
                          <input type="hidden" name="lessonId" value={lesson.id} />
                          <input type="hidden" name="blockId" value={block.id} />
                          <select name="type" defaultValue={block.type} className="rounded-xl border border-white/15 p-2">
                            <option value="TEXT">TEXT</option>
                            <option value="MARKDOWN">MARKDOWN</option>
                            <option value="IMAGE">IMAGE</option>
                            <option value="VIDEO">VIDEO</option>
                            <option value="EMBED">EMBED</option>
                          </select>
                          <input
                            name="position"
                            type="number"
                            className="rounded-xl border border-white/15 p-2"
                            defaultValue={block.position ?? 1}
                          />
                          <input name="textTh" placeholder="text th" defaultValue={block.textTh ?? ""} className="rounded-xl border border-white/15 p-2" />
                          <input name="textEn" placeholder="text en" defaultValue={block.textEn ?? ""} className="rounded-xl border border-white/15 p-2" />
                          <input name="markdownTh" placeholder="markdown th" defaultValue={block.markdownTh ?? ""} className="rounded-xl border border-white/15 p-2" />
                          <input name="markdownEn" placeholder="markdown en" defaultValue={block.markdownEn ?? ""} className="rounded-xl border border-white/15 p-2" />
                          <input name="imageUrl" placeholder="image url" defaultValue={block.imageUrl ?? ""} className="rounded-xl border border-white/15 p-2" />
                          <input name="videoUrl" placeholder="video url" defaultValue={block.videoUrl ?? ""} className="rounded-xl border border-white/15 p-2" />
                          <input name="embedUrl" placeholder="embed url" defaultValue={block.embedUrl ?? ""} className="rounded-xl border border-white/15 p-2" />
                          <div className="flex gap-2 md:col-span-3">
                            <button className="rounded-xl bg-white/10 px-4 py-2 text-white">Save block</button>
                            <button
                              formAction={deleteLessonBlock}
                              className="rounded-xl border border-rose-500/70 px-4 py-2 text-rose-300"
                            >
                              Delete block
                            </button>
                          </div>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
