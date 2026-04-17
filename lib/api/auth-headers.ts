import { AUTH_HEADER_SCHEME } from "@/lib/auth-constants";
import { getAuthTokenFromDocument } from "@/lib/auth-cookies";

/** Rotas da API que não devem enviar Authorization. */
const UNAUTHENTICATED_PATH_SUFFIXES = [
  "/auth/login",
  "/auth/register",
  "/auth/confirmar-email",
  "/auth/refresh",
  "/auth/disponibilidade",
];

export function shouldAttachAuthHeader(apiPath: string): boolean {
  const path = apiPath.split("?")[0] ?? apiPath;
  return !UNAUTHENTICATED_PATH_SUFFIXES.some((s) => path.endsWith(s));
}

/**
 * Monta headers com Bearer a partir do token (ou do cookie no browser).
 */
export function buildAuthHeaders(tokenOverride?: string | null): HeadersInit {
  const token =
    tokenOverride !== undefined ? tokenOverride : typeof window !== "undefined" ? getAuthTokenFromDocument() : null;

  if (!token?.trim()) {
    return {};
  }

  return {
    Authorization: `${AUTH_HEADER_SCHEME} ${token.trim()}`,
  };
}
