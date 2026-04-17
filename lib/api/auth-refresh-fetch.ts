import { apiUrl } from "@/lib/api/api-url";
import { getApiErrorMessage } from "@/lib/api/error-body";
import type { LoginResponse } from "@/lib/repositories/types/auth.types";
import { ApiError } from "@/lib/repositories/types/auth.types";

/**
 * POST `/auth/refresh` — não usa `apiFetch` para evitar ciclo com a fila de refresh da sessão.
 * Ajuste o path/body se o backend usar outro contrato (ex.: OAuth2 token endpoint).
 */
export async function fetchRefreshAccessToken(refreshToken: string): Promise<LoginResponse> {
  const url = apiUrl("/auth/refresh");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const fromJson = body && typeof body === "object" ? getApiErrorMessage(body) : null;
    const msg =
      fromJson ||
      (typeof body === "string" && body ? body : null) ||
      res.statusText ||
      `Erro HTTP ${res.status}`;
    throw new ApiError(msg, res.status, body);
  }

  return body as LoginResponse;
}
