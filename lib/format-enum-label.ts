/**
 * Exibe enums vindos da API (ex.: GASOLINA, AUTOMATICO, SUCATA) com apenas a primeira letra maiúscula.
 */
export function formatEnumDisplayLabel(value?: string | null): string {
  if (value == null) return "-";
  const t = String(value).trim();
  if (!t || t === "-") return "-";
  const normalized = t.toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
