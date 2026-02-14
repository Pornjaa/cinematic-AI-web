import { cookies } from "next/headers";

export const locales = ["th", "en"] as const;
export type Locale = (typeof locales)[number];

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value;
  return locale === "en" ? "en" : "th";
}

export function t<T extends { th: string; en: string }>(text: T, locale: Locale) {
  return locale === "en" ? text.en : text.th;
}
