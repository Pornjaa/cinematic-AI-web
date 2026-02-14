import type { Locale } from "@/lib/i18n";

export function pickLocalized(
  locale: Locale,
  valueTh: string | null | undefined,
  valueEn: string | null | undefined
) {
  const th = valueTh?.trim() ? valueTh : null;
  const en = valueEn?.trim() ? valueEn : null;
  return locale === "en" ? (en ?? th ?? "") : (th ?? en ?? "");
}
