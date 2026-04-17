import { fetchRefreshAccessToken } from "@/lib/api/auth-refresh-fetch";
import { extractAccessTokenFromLoginBody } from "@/lib/auth-token-utils";
import {
  clearAllAuthCookies,
  getAccessExpiresAtMsFromDocument,
  getAuthTokenFromDocument,
  getRefreshTokenFromDocument,
  setAccessExpiresAtMsCookie,
  setAuthTokenCookie,
  setRefreshTokenCookie,
  clearAccessExpiresAtCookie,
  clearRefreshTokenCookie,
} from "@/lib/auth-cookies";
import type { LoginResponse } from "@/lib/repositories/types/auth.types";
import { ApiError } from "@/lib/repositories/types/auth.types";

/** Renovar um pouco antes do fim real do access token (evita 401 por relógio/rede). */
const REFRESH_SLACK_MS = 90_000;

let refreshInFlight: Promise<boolean> | null = null;

function decodeJwtExpMs(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadBase64Url = parts[1];
    const payloadBase64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadBase64.padEnd(Math.ceil(payloadBase64.length / 4) * 4, "=");
    const json = atob(padded);
    const payload = JSON.parse(json) as { exp?: unknown };
    const expSec = Number(payload?.exp);
    if (!Number.isFinite(expSec) || expSec <= 0) return null;
    return Math.floor(expSec * 1000);
  } catch {
    return null;
  }
}

function parseExpiresInSeconds(raw: LoginResponse): number | null {
  const pick = (v: unknown): number | null => {
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return Math.floor(v);
    if (typeof v === "string") {
      const n = Number(v.trim());
      if (Number.isFinite(n) && n > 0) return Math.floor(n);
    }
    return null;
  };

  return (
    pick(raw.expiresIn) ??
    pick((raw as { expiresInSeconds?: unknown }).expiresInSeconds) ??
    pick((raw as { expires_in?: unknown }).expires_in)
  );
}

function resolveAccessExpiresAtMs(raw: LoginResponse, token: string): number | null {
  const fromJwt = decodeJwtExpMs(token);
  const fromBodySec = parseExpiresInSeconds(raw);
  const fromBodyMs = fromBodySec != null ? Date.now() + fromBodySec * 1000 : null;

  // A API valida o JWT: se `exp` do token for menor que o `expiresIn` declarado, o limite real é o JWT.
  // Se o JWT vier sem `exp` mas o body tiver `expiresIn`, usamos o body.
  if (fromJwt != null && fromBodyMs != null) {
    return Math.min(fromJwt, fromBodyMs);
  }
  if (fromJwt != null) return fromJwt;
  if (fromBodyMs != null) return fromBodyMs;
  return null;
}

function loginReturnPath(): string {
  if (typeof window === "undefined") return "/auth";
  const path = `${window.location.pathname}${window.location.search || ""}`;
  if (path.startsWith("/auth")) {
    return path.length > "/auth".length ? path : "/auth";
  }
  const q = new URLSearchParams({ returnUrl: path });
  return `/auth?${q.toString()}`;
}

export function applyAuthSessionFromLoginResponse(raw: LoginResponse, accessTokenOverride?: string): void {
  const token = accessTokenOverride ?? extractAccessTokenFromLoginBody(raw);
  if (!token) return;

  const expiresAtMs = resolveAccessExpiresAtMs(raw, token);
  const expiresInSec = expiresAtMs != null ? Math.max(1, Math.floor((expiresAtMs - Date.now()) / 1000)) : undefined;

  setAuthTokenCookie(token, expiresInSec);

  if (expiresAtMs != null && expiresInSec != null) {
    setAccessExpiresAtMsCookie(expiresAtMs, expiresInSec);
  } else {
    clearAccessExpiresAtCookie();
  }

  if (typeof raw.refreshToken === "string") {
    const rt = raw.refreshToken.trim();
    if (rt) setRefreshTokenCookie(rt);
    else clearRefreshTokenCookie();
  }
}

export function clearAuthSessionAndRedirectToLogin(): void {
  if (typeof window === "undefined") return;
  clearAllAuthCookies();
  window.location.assign(loginReturnPath());
}

function isAccessExpiredProactive(): boolean {
  const exp = getAccessExpiresAtMsFromDocument();
  if (exp == null) return false;
  return Date.now() >= exp - REFRESH_SLACK_MS;
}

async function runRefreshOnce(): Promise<boolean> {
  const rt = getRefreshTokenFromDocument();
  if (!rt) return false;
  try {
    const raw = await fetchRefreshAccessToken(rt);
    const token = extractAccessTokenFromLoginBody(raw);
    if (!token) return false;
    applyAuthSessionFromLoginResponse(raw, token);
    return true;
  } catch {
    return false;
  }
}

/**
 * Garante access token válido antes de chamadas autenticadas (browser).
 * Sem refresh token e access “vencido” por relógio → login.
 */
export async function ensureFreshAccessToken(): Promise<void> {
  if (typeof window === "undefined") return;
  const token = getAuthTokenFromDocument();
  if (!token) return;
  if (!isAccessExpiredProactive()) return;

  const rt = getRefreshTokenFromDocument();
  if (!rt) {
    // Sem refresh token: não desloga só pelo relógio — o access pode ainda ser aceito pela API.
    // Se estiver expirado de fato, o próximo `apiFetch` recebe 401 e aí sim redireciona após tentar recover.
    return;
  }

  if (!refreshInFlight) {
    refreshInFlight = runRefreshOnce().finally(() => {
      refreshInFlight = null;
    });
  }
  const ok = await refreshInFlight;
  if (!ok) {
    clearAuthSessionAndRedirectToLogin();
    throw new ApiError("Sessão expirada. Faça login novamente.", 401);
  }
}

/** Após 401 em rota autenticada: tenta refresh uma vez (sem redirect se não houver refresh). */
export async function tryRecoverSessionWithRefresh(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!getRefreshTokenFromDocument()) return false;
  if (!refreshInFlight) {
    refreshInFlight = runRefreshOnce().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}
