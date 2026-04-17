import { getApiErrorMessage } from "@/lib/api/error-body";
import { normalizeApiText } from "@/lib/api/repair-api-text";
import { apiUrl } from "@/lib/api/api-url";
import { buildAuthHeaders, shouldAttachAuthHeader } from "@/lib/api/auth-headers";
import { getAuthTokenFromDocument } from "@/lib/auth-cookies";
import {
  clearAuthSessionAndRedirectToLogin,
  ensureFreshAccessToken,
  tryRecoverSessionWithRefresh,
} from "@/lib/auth-session";
import { ApiError } from "@/lib/repositories/types/auth.types";

export type ApiFetchOptions = RequestInit & {
  /** Quando true, não envia Authorization (ex.: login). */
  skipAuth?: boolean;
  /** Token explícito (ex.: logo após login, antes do cookie propagar). */
  token?: string | null;
  /** Uso interno: evita loop após refresh pós-401. */
  _retryAfterRefresh?: boolean;
};

export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuth, token, _retryAfterRefresh, headers: initHeaders, ...rest } = options;
  const url = apiUrl(path);

  const baseHeaders = new Headers(initHeaders);
  if (!baseHeaders.has("Content-Type") && rest.body && !(rest.body instanceof FormData)) {
    baseHeaders.set("Content-Type", "application/json");
  }

  const attach = !skipAuth && shouldAttachAuthHeader(path);

  if (
    attach &&
    typeof window !== "undefined" &&
    !_retryAfterRefresh &&
    (token === undefined || token === null)
  ) {
    await ensureFreshAccessToken();
  }

  /** `undefined` = usa token do cookie; `null` = sem Bearer explícito (raro). */
  const authHeaders = attach ? buildAuthHeaders(token) : {};
  const merged = new Headers(authHeaders);
  baseHeaders.forEach((v, k) => merged.set(k, v));

  /** Rotas públicas (`skipAuth`): não enviar Bearer nem cookies para a API (evita 401 por JWT expirado em cookie). */
  if (skipAuth) {
    merged.delete("Authorization");
  }

  const res = await fetch(url, {
    ...rest,
    headers: merged,
    ...(skipAuth && rest.credentials === undefined
      ? { credentials: "omit" as RequestCredentials }
      : {}),
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !skipAuth &&
      attach &&
      !_retryAfterRefresh
    ) {
      const recovered = await tryRecoverSessionWithRefresh();
      if (recovered) {
        return apiFetch(path, { ...options, _retryAfterRefresh: true });
      }
      if (getAuthTokenFromDocument()) {
        clearAuthSessionAndRedirectToLogin();
      }
    }

    const fromJson = body && typeof body === "object" ? getApiErrorMessage(body) : null;
    const rawMsg =
      fromJson ||
      (typeof body === "string" && body ? body : null) ||
      res.statusText ||
      `Erro HTTP ${res.status}`;
    const msg = normalizeApiText(rawMsg);
    throw new ApiError(msg, res.status, body);
  }

  return body as T;
}
