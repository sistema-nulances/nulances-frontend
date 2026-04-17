import { normalizeApiText } from "@/lib/api/repair-api-text";

function isGenericInternalServerError(s: string): boolean {
  return /^internal server error$/i.test(s.trim());
}

/**
 * Extrai mensagem de erros Spring Boot / Problem Details / formatos comuns.
 * Em produção o JSON costuma trazer `message`/`error` genéricos; o texto útil fica em `detail` (RFC 7807).
 */
export function getApiErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const message = typeof o.message === "string" ? o.message.trim() : "";
  const detail = typeof o.detail === "string" ? o.detail.trim() : "";
  const error = typeof o.error === "string" ? o.error.trim() : "";

  let raw: string | null = null;
  if (detail && (!message || isGenericInternalServerError(message))) raw = detail;
  else if (message && !isGenericInternalServerError(message)) raw = message;
  else if (message) raw = message;
  else if (detail) raw = detail;
  else if (error && error.length < 200 && !isGenericInternalServerError(error)) raw = error;

  if (!raw) {
    const errors = o.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0];
      if (first && typeof first === "object") {
        const e0 = first as Record<string, unknown>;
        const dm = typeof e0.defaultMessage === "string" ? e0.defaultMessage.trim() : "";
        if (dm) raw = dm;
      }
    }
  }

  return raw ? normalizeApiText(raw) : null;
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
  return typeof t === "string" && t.trim() ? normalizeApiText(t.trim()) : null;
}
