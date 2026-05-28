import type { SelectOption } from "@/components/ui/select";

/** Condição de anúncio no marketplace (distinto de leilão / monta). */

export const ANUNCIO_CONDICOES = ["Novo", "Usado", "Seminovo"] as const;

export type AnuncioCondicao = (typeof ANUNCIO_CONDICOES)[number];

export const ANUNCIO_CONDICAO_API: SelectOption[] = [
  { value: "", label: "Selecione a condição" },
  { value: "NOVO", label: "Novo" },
  { value: "USADO", label: "Usado" },
  { value: "SEMINOVO", label: "Seminovo" },
];

/** Valores legados de leilão (monta) → marketplace. */
const LEGACY_CONDICAO_MAP: Record<string, string> = {
  PEQUENA_MONTA: "USADO",
  MEDIA_MONTA: "USADO",
  GRANDE_MONTA: "USADO",
};

const COND_LABEL = new Map(ANUNCIO_CONDICAO_API.filter((o) => o.value).map((o) => [o.value, o.label]));

export function labelCondicaoAnuncioApi(code: string | undefined | null): string {
  if (!code) return "";
  const upper = String(code).trim().toUpperCase();
  const normalized = LEGACY_CONDICAO_MAP[upper] ?? upper;
  return COND_LABEL.get(normalized) ?? "";
}
