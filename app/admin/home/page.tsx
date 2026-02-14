import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { ImageUploadField } from "@/components/admin/image-upload-field";

const dbWithOptionalOnsite = db as unknown as {
  onsiteHighlight?: {
    create: (args: unknown) => Promise<unknown>;
    delete: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<Array<{
      id: string;
      slug: string;
      titleTh: string;
      titleEn: string;
      status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
      position: number;
    }>>;
  };
};

const dbWithOptionalHomeCopy = db as unknown as {
  homeCopy?: {
    upsert: (args: unknown) => Promise<unknown>;
    findUnique: (args: unknown) => Promise<{
      id: string;
      taglineTh: string | null;
      taglineEn: string | null;
    } | null>;
  };
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function createHeroSlide(formData: FormData) {
  "use server";
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  if (!imageUrl) return;

  await db.heroSlide.create({
    data: {
      imageUrl,
      titleTh: String(formData.get("titleTh") || ""),
      titleEn: String(formData.get("titleEn") || ""),
      subtitleTh: String(formData.get("subtitleTh") || ""),
      subtitleEn: String(formData.get("subtitleEn") || ""),
      position: Number(formData.get("position") || 1)
    }
  });
  revalidatePath("/");
}

async function createFaq(formData: FormData) {
  "use server";
  await db.fAQ.create({
    data: {
      questionTh: String(formData.get("questionTh") || ""),
      questionEn: String(formData.get("questionEn") || ""),
      answerTh: String(formData.get("answerTh") || ""),
      answerEn: String(formData.get("answerEn") || ""),
      position: Number(formData.get("position") || 1)
    }
  });
  revalidatePath("/");
}

async function updateFaq(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;

  await db.fAQ.update({
    where: { id },
    data: {
      questionTh: String(formData.get("questionTh") || ""),
      questionEn: String(formData.get("questionEn") || ""),
      answerTh: String(formData.get("answerTh") || ""),
      answerEn: String(formData.get("answerEn") || ""),
      position: Number(formData.get("position") || 1)
    }
  });
  revalidatePath("/");
  revalidatePath("/admin/home");
}

async function deleteFaq(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;
  await db.fAQ.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/home");
}

async function saveHomeTagline(formData: FormData) {
  "use server";
  if (!dbWithOptionalHomeCopy.homeCopy) return;
  try {
    await dbWithOptionalHomeCopy.homeCopy.upsert({
      where: { id: "home-copy" },
      update: {
        taglineTh: String(formData.get("taglineTh") || ""),
        taglineEn: String(formData.get("taglineEn") || "")
      },
      create: {
        id: "home-copy",
        taglineTh: String(formData.get("taglineTh") || ""),
        taglineEn: String(formData.get("taglineEn") || "")
      }
    });
  } catch {
    // Table may not exist in current DB; ignore to avoid crashing the admin page.
    return;
  }
  revalidatePath("/");
  revalidatePath("/admin/home");
}

async function getHomeCopySafe() {
  if (!dbWithOptionalHomeCopy.homeCopy) return null;
  try {
    return await dbWithOptionalHomeCopy.homeCopy.findUnique({ where: { id: "home-copy" } });
  } catch {
    return null;
  }
}

async function createOnsiteHighlight(formData: FormData) {
  "use server";
  if (!dbWithOptionalOnsite.onsiteHighlight) return;
  const rawSlug = String(formData.get("slug") || "").trim();
  const titleTh = String(formData.get("titleTh") || "").trim();
  const titleEn = String(formData.get("titleEn") || "").trim();
  const safeSlug = rawSlug || `${slugify(titleEn || titleTh || "onsite")}-${Date.now()}`;

  await dbWithOptionalOnsite.onsiteHighlight.create({
    data: {
      slug: safeSlug,
      titleTh,
      titleEn,
      descriptionTh: String(formData.get("descriptionTh") || ""),
      descriptionEn: String(formData.get("descriptionEn") || ""),
      thumbnailUrl: String(formData.get("thumbnailUrl") || ""),
      externalVideoUrl: String(formData.get("externalVideoUrl") || ""),
      status: String(formData.get("status") || "PUBLISHED") as "DRAFT" | "PUBLISHED" | "SCHEDULED",
      publishedAt: formData.get("publishedAt") ? new Date(String(formData.get("publishedAt"))) : null,
      position: Number(formData.get("position") || 1)
    }
  });
  revalidatePath("/");
  revalidatePath("/admin/home");
}

async function deleteOnsiteHighlight(formData: FormData) {
  "use server";
  if (!dbWithOptionalOnsite.onsiteHighlight) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  await dbWithOptionalOnsite.onsiteHighlight.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/home");
}

export default async function AdminHomePage() {
  const [slides, faqs, onsite, homeCopy] = await Promise.all([
    db.heroSlide.findMany({ orderBy: { position: "asc" } }),
    db.fAQ.findMany({ orderBy: { position: "asc" } }),
    dbWithOptionalOnsite.onsiteHighlight
      ? dbWithOptionalOnsite.onsiteHighlight.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] })
      : Promise.resolve([]),
    getHomeCopySafe()
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Home content</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <form action={createHeroSlide} className="space-y-2 rounded-3xl cinematic-card p-5">
          <h2 className="font-semibold">Add Hero Slide</h2>
          <ImageUploadField name="imageUrl" />
          <input name="titleTh" placeholder="Title TH" className="w-full rounded-xl border border-white/15 p-2" required />
          <input name="titleEn" placeholder="Title EN" className="w-full rounded-xl border border-white/15 p-2" required />
          <input name="subtitleTh" placeholder="Subtitle TH" className="w-full rounded-xl border border-white/15 p-2" />
          <input name="subtitleEn" placeholder="Subtitle EN" className="w-full rounded-xl border border-white/15 p-2" />
          <input name="position" placeholder="Position" type="number" className="w-full rounded-xl border border-white/15 p-2" defaultValue={slides.length + 1} />
          <button className="rounded-xl bg-brand-700 px-4 py-2 text-white">Save</button>
          <p className="text-xs text-zinc-400">Add many slides by saving this form multiple times. Home hero will autoplay + fade.</p>
        </form>

        <form action={createFaq} className="space-y-2 rounded-3xl cinematic-card p-5">
          <h2 className="font-semibold">Add FAQ</h2>
          <input name="questionTh" placeholder="Question TH" className="w-full rounded-xl border border-white/15 p-2" required />
          <input name="questionEn" placeholder="Question EN" className="w-full rounded-xl border border-white/15 p-2" required />
          <textarea name="answerTh" placeholder="Answer TH" className="w-full rounded-xl border border-white/15 p-2" required />
          <textarea name="answerEn" placeholder="Answer EN" className="w-full rounded-xl border border-white/15 p-2" required />
          <input name="position" placeholder="Position" type="number" className="w-full rounded-xl border border-white/15 p-2" defaultValue={faqs.length + 1} />
          <button className="rounded-xl bg-brand-700 px-4 py-2 text-white">Save</button>
        </form>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {slides.map((slide) => (
          <div key={slide.id} className="rounded-2xl cinematic-card p-4 text-sm">
            #{slide.position} {slide.titleTh} / {slide.titleEn}
          </div>
        ))}
      </div>

      <form action={saveHomeTagline} className="space-y-2 rounded-3xl cinematic-card p-5">
        <h2 className="font-semibold">Homepage tagline (คำโปรยใต้ปก)</h2>
        <input
          name="taglineTh"
          defaultValue={homeCopy?.taglineTh ?? ""}
          placeholder="Tagline TH"
          className="w-full rounded-xl border border-white/15 p-2"
        />
        <input
          name="taglineEn"
          defaultValue={homeCopy?.taglineEn ?? ""}
          placeholder="Tagline EN"
          className="w-full rounded-xl border border-white/15 p-2"
        />
        <button className="rounded-xl bg-brand-700 px-4 py-2 text-white">Save tagline</button>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Manage FAQ</h2>
        {faqs.map((faq) => (
          <form key={faq.id} action={updateFaq} className="space-y-2 rounded-2xl cinematic-card p-4">
            <input type="hidden" name="id" value={faq.id} />
            <div className="grid gap-2 md:grid-cols-2">
              <input name="questionTh" defaultValue={faq.questionTh} className="w-full rounded-xl border border-white/15 p-2" />
              <input name="questionEn" defaultValue={faq.questionEn} className="w-full rounded-xl border border-white/15 p-2" />
              <textarea name="answerTh" defaultValue={faq.answerTh} className="w-full rounded-xl border border-white/15 p-2" />
              <textarea name="answerEn" defaultValue={faq.answerEn} className="w-full rounded-xl border border-white/15 p-2" />
              <input name="position" type="number" defaultValue={faq.position} className="w-full rounded-xl border border-white/15 p-2" />
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-xl bg-brand-700 px-4 py-2 text-white">Save FAQ</button>
              <button formAction={deleteFaq} className="rounded-xl border border-rose-500/50 px-4 py-2 text-rose-300 hover:bg-rose-500/10">
                Delete FAQ
              </button>
            </div>
          </form>
        ))}
      </div>

      <div className="space-y-4">
        <form action={createOnsiteHighlight} className="space-y-2 rounded-3xl cinematic-card p-5">
          <h2 className="font-semibold">Add บรรยากาศคอร์สสอนสด onsite</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <input name="slug" placeholder="slug (optional)" className="w-full rounded-xl border border-white/15 p-2" />
            <input name="position" placeholder="position" type="number" className="w-full rounded-xl border border-white/15 p-2" defaultValue={onsite.length + 1} />
            <input name="titleTh" placeholder="title th" className="w-full rounded-xl border border-white/15 p-2" required />
            <input name="titleEn" placeholder="title en" className="w-full rounded-xl border border-white/15 p-2" required />
            <input name="descriptionTh" placeholder="description th" className="w-full rounded-xl border border-white/15 p-2" />
            <input name="descriptionEn" placeholder="description en" className="w-full rounded-xl border border-white/15 p-2" />
            <input name="thumbnailUrl" placeholder="thumbnail url" className="w-full rounded-xl border border-white/15 p-2" />
            <input name="externalVideoUrl" placeholder="video url" className="w-full rounded-xl border border-white/15 p-2" />
            <input name="publishedAt" type="datetime-local" className="w-full rounded-xl border border-white/15 p-2" />
            <select name="status" className="w-full rounded-xl border border-white/15 p-2" defaultValue="PUBLISHED">
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
            </select>
          </div>
          <button className="rounded-xl bg-brand-700 px-4 py-2 text-white">Save onsite section</button>
        </form>

        <div className="space-y-2">
          {onsite.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl cinematic-card p-4 text-sm">
              <p>
                #{item.position} {item.titleTh} ({item.slug}) - {item.status}
              </p>
              <form action={deleteOnsiteHighlight}>
                <input type="hidden" name="id" value={item.id} />
                <button className="rounded-full border border-rose-500/50 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/10">
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
