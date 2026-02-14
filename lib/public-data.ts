import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

const now = () => new Date();
const dbWithOptionalOnsite = db as unknown as {
  onsiteHighlight?: {
    findMany: (args: unknown) => Promise<Array<{
      id: string;
      slug: string;
      titleTh: string;
      titleEn: string;
      descriptionTh: string | null;
      descriptionEn: string | null;
      externalVideoUrl: string | null;
      thumbnailUrl: string | null;
      status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
      publishedAt: Date | null;
      position: number;
      createdAt: Date;
      updatedAt: Date;
    }>>;
  };
};

const dbWithOptionalHomeCopy = db as unknown as {
  homeCopy?: {
    findUnique: (args: unknown) => Promise<{
      id: string;
      taglineTh: string | null;
      taglineEn: string | null;
    } | null>;
  };
};

export const getCachedHeroSlides = unstable_cache(
  async () => db.heroSlide.findMany({ orderBy: { position: "asc" }, take: 6 }),
  ["hero-slides"],
  { revalidate: 10 }
);

export const getCachedFaqs = unstable_cache(
  async () => db.fAQ.findMany({ orderBy: { position: "asc" } }),
  ["faqs"],
  { revalidate: 10 }
);

export const getCachedShowreels = unstable_cache(
  async () => db.showreel.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } }),
  ["showreels-published"],
  { revalidate: 10 }
);

export const getCachedOnsiteHighlights = unstable_cache(
  async () => {
    if (!dbWithOptionalOnsite.onsiteHighlight) return [];
    return dbWithOptionalOnsite.onsiteHighlight.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }]
    });
  },
  ["onsite-highlights-published"],
  { revalidate: 10 }
);

export const getCachedCourses = unstable_cache(
  async () =>
    db.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { position: "asc" }
    }),
  ["courses-published"],
  { revalidate: 10 }
);

export const getCachedArticles = unstable_cache(
  async () => db.article.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" } }),
  ["articles-published"],
  { revalidate: 10 }
);

export const getCachedTutorials = unstable_cache(
  async () => db.freeTutorial.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" } }),
  ["tutorials-published"],
  { revalidate: 10 }
);

export const getCachedFooterSetting = unstable_cache(
  async () => db.siteSetting.findUnique({ where: { id: "default-site" } }),
  ["site-setting-footer"],
  { revalidate: 10 }
);

export const getCachedHomeCopy = unstable_cache(
  async () => {
    if (!dbWithOptionalHomeCopy.homeCopy) {
      return { taglineTh: null, taglineEn: null };
    }
    try {
      const copy = await dbWithOptionalHomeCopy.homeCopy.findUnique({ where: { id: "home-copy" } });
      return { taglineTh: copy?.taglineTh ?? null, taglineEn: copy?.taglineEn ?? null };
    } catch {
      return { taglineTh: null, taglineEn: null };
    }
  },
  ["home-copy"],
  { revalidate: 10 }
);

export function isPublishedDate(publishedAt: Date | null) {
  return !publishedAt || publishedAt <= now();
}
