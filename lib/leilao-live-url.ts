function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function normalizeOptionalHttpUrl(raw: string | null | undefined): string | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const parsed = parseUrl(value);
  if (!parsed) return null;
  const protocol = parsed.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") return null;
  return parsed.toString();
}

export function isValidHttpUrl(raw: string | null | undefined): boolean {
  return normalizeOptionalHttpUrl(raw) !== null;
}

export function extractYouTubeVideoId(url: string): string | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;

  const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();
  if (host === "youtube.com" || host === "m.youtube.com") {
    const watchId = parsed.searchParams.get("v");
    if (watchId) return watchId;

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts[0] === "live" && parts[1]) return parts[1];
  }

  if (host === "youtu.be") {
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts[0]) return parts[0];
  }

  return null;
}

export function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}
