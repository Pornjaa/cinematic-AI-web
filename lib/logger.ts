export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    console.info(`[INFO] ${message}`, sanitize(meta));
  },
  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(`[WARN] ${message}`, sanitize(meta));
  },
  error(message: string, meta?: Record<string, unknown>) {
    console.error(`[ERROR] ${message}`, sanitize(meta));
  }
};

function sanitize(meta?: Record<string, unknown>) {
  if (!meta) return undefined;
  const copy: Record<string, unknown> = { ...meta };
  const blocked = ["password", "token", "secret", "authorization"];
  for (const key of Object.keys(copy)) {
    if (blocked.some((item) => key.toLowerCase().includes(item))) {
      copy[key] = "[REDACTED]";
    }
  }
  return copy;
}
