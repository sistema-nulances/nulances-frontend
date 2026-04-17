import {
  AUTH_ACCESS_EXP_MS_COOKIE,
  AUTH_REFRESH_TOKEN_COOKIE,
  AUTH_TOKEN_COOKIE,
} from "@/lib/auth-constants";

const FALLBACK_ACCESS_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 dias se a API não mandar expiresIn
const REFRESH_TOKEN_MAX_AGE_SEC = 60 * 60 * 24 * 30;

function readCookieRaw(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeSec: number): void {
  if (typeof document === "undefined") return;
  const safe = encodeURIComponent(value);
  document.cookie = `${name}=${safe}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getAuthTokenFromDocument(): string | null {
  const v = readCookieRaw(AUTH_TOKEN_COOKIE);
  return v && v.trim() ? v.trim() : null;
}

export function getRefreshTokenFromDocument(): string | null {
  const v = readCookieRaw(AUTH_REFRESH_TOKEN_COOKIE);
  return v && v.trim() ? v.trim() : null;
}

/** Epoch ms do fim do access token; null se ausente. */
export function getAccessExpiresAtMsFromDocument(): number | null {
  const v = readCookieRaw(AUTH_ACCESS_EXP_MS_COOKIE);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Access token. `maxAgeSec` deve refletir `expiresIn` do backend (segundos) quando existir.
 */
export function setAuthTokenCookie(token: string, maxAgeSec?: number): void {
  const age =
    maxAgeSec != null && maxAgeSec > 0
      ? Math.min(Math.floor(maxAgeSec), 60 * 60 * 24 * 365)
      : FALLBACK_ACCESS_MAX_AGE_SEC;
  setCookie(AUTH_TOKEN_COOKIE, token.trim(), age);
}

export function setAccessExpiresAtMsCookie(expiresAtMs: number, cookieMaxAgeSec?: number): void {
  const age =
    cookieMaxAgeSec != null && cookieMaxAgeSec > 0
      ? Math.min(Math.floor(cookieMaxAgeSec), 60 * 60 * 24 * 365)
      : FALLBACK_ACCESS_MAX_AGE_SEC;
  setCookie(AUTH_ACCESS_EXP_MS_COOKIE, String(Math.floor(expiresAtMs)), age);
}

export function clearAccessExpiresAtCookie(): void {
  clearCookie(AUTH_ACCESS_EXP_MS_COOKIE);
}

export function setRefreshTokenCookie(refreshToken: string): void {
  setCookie(AUTH_REFRESH_TOKEN_COOKIE, refreshToken.trim(), REFRESH_TOKEN_MAX_AGE_SEC);
}

export function clearRefreshTokenCookie(): void {
  clearCookie(AUTH_REFRESH_TOKEN_COOKIE);
}

export function clearAuthTokenCookie(): void {
  clearCookie(AUTH_TOKEN_COOKIE);
}

/** Limpa access, exp e refresh (logout / sessão inválida). */
export function clearAllAuthCookies(): void {
  clearAuthTokenCookie();
  clearAccessExpiresAtCookie();
  clearRefreshTokenCookie();
}
