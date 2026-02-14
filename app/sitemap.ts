import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getBaseUrl } from "@/lib/base-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const [articles, courses, showreels, tutorials] = await Promise.all([
    db.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.course.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.showreel.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    db.freeTutorial.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } })
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/showreel",
    "/articles",
    "/courses",
    "/free-tutorials"
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.8
  }));

  return [
    ...staticPages,
    ...articles.map((item) => ({ url: `${base}/articles/${item.slug}`, lastModified: item.updatedAt })),
    ...courses.map((item) => ({ url: `${base}/courses/${item.slug}`, lastModified: item.updatedAt })),
    ...showreels.map((item) => ({ url: `${base}/showreel/${item.slug}`, lastModified: item.updatedAt })),
    ...tutorials.map((item) => ({ url: `${base}/free-tutorials/${item.slug}`, lastModified: item.updatedAt }))
  ];
}
