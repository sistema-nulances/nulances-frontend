/**
 * Extrai mensagem de erros Spring Boot / Problem Details / formatos comuns.
 */
export function getApiErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (typeof o.message === "string" && o.message.trim()) return o.message;
  if (typeof o.detail === "string" && o.detail.trim()) return o.detail;
  if (typeof o.error === "string" && o.error.trim() && o.error.length < 200) return o.error;
  return null;
}

/** Código de negócio estável (recomendado no backend). */
export function getApiErrorCode(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (typeof o.code === "string" && o.code.trim()) return o.code.trim();
  return null;
}

/** Stack trace em erros JSON do Spring Boot (página de erro padrão). */
export function getApiErrorTrace(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const t = (body as Record<string, unknown>).trace;
  return typeof t === "string" && t.trim() ? t : null;
}
