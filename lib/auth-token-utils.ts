import type { LoginResponse } from "@/lib/repositories/types/auth.types";

export function extractAccessTokenFromLoginBody(data: LoginResponse | null | undefined): string | null {
  if (!data || typeof data !== "object") return null;
  const t = data.accessToken ?? data.token ?? data.access_token;
  return typeof t === "string" && t.trim() ? t.trim() : null;
}
