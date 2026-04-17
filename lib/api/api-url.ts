type ResolvedApiTarget = {
  origin: string;
  contextPath: string;
};

function resolveApiTarget(): ResolvedApiTarget {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:8080";
  const explicitCtx = process.env.NEXT_PUBLIC_API_CONTEXT_PATH;

  try {
    const u = new URL(raw);
    const pathname = (u.pathname || "/").replace(/\/$/, "") || "/";

    if (pathname !== "/") {
      return {
        origin: u.origin,
        contextPath: pathname,
      };
    }

    if (explicitCtx !== undefined) {
      const v = explicitCtx.trim();
      if (!v) return { origin: u.origin, contextPath: "" };
      const withSlash = v.startsWith("/") ? v : `/${v}`;
      return { origin: u.origin, contextPath: withSlash.replace(/\/$/, "") };
    }

    return { origin: u.origin, contextPath: "" };
  } catch {
    const base = raw.replace(/\/$/, "");
    const ctxRaw = explicitCtx?.trim();
    if (ctxRaw === "") return { origin: base, contextPath: "" };
    if (ctxRaw) {
      const withSlash = ctxRaw.startsWith("/") ? ctxRaw : `/${ctxRaw}`;
      return { origin: base, contextPath: withSlash.replace(/\/$/, "") };
    }
    return { origin: base, contextPath: "" };
  }
}

export function getApiOrigin(): string {
  return resolveApiTarget().origin;
}

export function getApiBaseUrl(): string {
  const { origin, contextPath } = resolveApiTarget();
  return `${origin}${contextPath}`.replace(/\/$/, "");
}

export function getApiContextPath(): string {
  return resolveApiTarget().contextPath;
}

export function apiUrl(path: string): string {
  const { origin, contextPath } = resolveApiTarget();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${contextPath}${p}`;
}
