export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const watch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  if (watch?.[1]) {
    return `https://www.youtube.com/embed/${watch[1]}`;
  }

  const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (shorts?.[1]) {
    return `https://www.youtube.com/embed/${shorts[1]}`;
  }

  return null;
}

export function isDirectVideoFile(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(mp4|mov|m4v|webm|ogg)(\?|$)/i.test(url);
}

export function normalizeMuxVideoUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;

  // Keep full URL when it already has query params (signed URLs, tokens, etc.).
  if (value.startsWith("http") && value.includes("?")) return value;

  // Raw playback ID -> stream URL
  if (!value.startsWith("http")) {
    return `https://stream.mux.com/${value}/medium.mp4`;
  }

  const streamMatch = value.match(/stream\.mux\.com\/([^/?]+)/i);
  if (streamMatch?.[1]) {
    const id = streamMatch[1].replace(/\.(m3u8|mp4)$/i, "");
    return `https://stream.mux.com/${id}/medium.mp4`;
  }

  const playerMatch = value.match(/player\.mux\.com\/([^/?]+)/i);
  if (playerMatch?.[1]) {
    return `https://stream.mux.com/${playerMatch[1]}/medium.mp4`;
  }

  return value;
}

export function extractMuxPlaybackId(input: string | null | undefined): string | null {
  if (!input) return null;
  const value = input.trim();
  if (!value) return null;

  if (!value.startsWith("http")) return value;

  const streamMatch = value.match(/stream\.mux\.com\/([^/?]+)/i);
  if (streamMatch?.[1]) return streamMatch[1].replace(/\.(m3u8|mp4)$/i, "");

  const playerMatch = value.match(/player\.mux\.com\/([^/?]+)/i);
  if (playerMatch?.[1]) return playerMatch[1];

  return null;
}
