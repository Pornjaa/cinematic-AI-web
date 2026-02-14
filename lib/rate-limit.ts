const store = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const item = store.get(key);

  if (!item || item.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (item.count >= limit) {
    return true;
  }

  item.count += 1;
  store.set(key, item);
  return false;
}
