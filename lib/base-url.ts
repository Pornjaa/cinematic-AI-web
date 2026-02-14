const FALLBACK_BASE_URL = "http://localhost:3000";

function ensureProtocol(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function getBaseUrl() {
  const raw = (process.env.NEXTAUTH_URL ?? "").trim();
  if (!raw) return FALLBACK_BASE_URL;

  try {
    return new URL(ensureProtocol(raw)).origin;
  } catch {
    return FALLBACK_BASE_URL;
  }
}

export function toAbsoluteUrl(path: string) {
  return new URL(path, getBaseUrl()).toString();
}
