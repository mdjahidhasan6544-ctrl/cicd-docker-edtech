export function extractYouTubeId(value = "") {
  const trimmed = `${value}`.trim();

  if (!trimmed) {
    return "";
  }

  if (!trimmed.includes("://") && !trimmed.includes("youtube.com") && !trimmed.includes("youtu.be")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace(/^\/+/, "").trim();
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.searchParams.get("v")) {
        return parsed.searchParams.get("v").trim();
      }

      const pathMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);

      if (pathMatch?.[1]) {
        return pathMatch[1].trim();
      }
    }
  } catch {
    return "";
  }

  return "";
}

export function getLessonExternalUrl(lesson) {
  const contentType = lesson.contentType || "youtube";

  if (contentType === "youtube") {
    const videoId = extractYouTubeId(lesson.youtubeId);
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";
  }

  return lesson.resourceUrl || "";
}
