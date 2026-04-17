import { inferMarcaDisplayTitleFromNome } from "@/lib/bem-marca-icon";
import { marcaVeiculoLabel, normalizeMarcaVeiculoCode } from "@/lib/bem-marca-veiculo";

export function marcaLeilaoItemLabel(marcaRaw?: string | null): string {
  return marcaVeiculoLabel(normalizeMarcaVeiculoCode(String(marcaRaw ?? "").trim())).trim();
}

/** Rótulo da marca: API (`MarcaVeiculo`) ou inferido pelo nome do bem (igual ao ícone). */
export function marcaLeilaoItemLabelOuInferida(
  marcaRaw?: string | null,
  nomeFallback?: string | null
): string {
  const fromApi = marcaLeilaoItemLabel(marcaRaw);
  if (fromApi) return fromApi;
  return inferMarcaDisplayTitleFromNome(String(nomeFallback ?? ""));
}

function foldParaCompararMarca(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Remove prefixo da marca no texto do modelo e evita duplicar a marca quando o “modelo”
 * é só o nome da marca com casing estranho (ex.: `bENTLEY` ao lado do rótulo `Bentley`).
 */
export function textoSemPrefixoMarca(marca: string, texto: string): string {
  const t = texto.trim();
  const m = marca.trim();
  if (!m || !t) return t;
  const escaped = m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rest = t.replace(new RegExp(`^${escaped}\\s+`, "i"), "").trim();
  if (rest !== t) return rest;
  if (foldParaCompararMarca(t) === foldParaCompararMarca(m)) return "";
  return t;
}

/**
 * Título em destaque no card da home (marca; se não houver, modelo).
 * Alinhado ao mock: headline = marca (ex.: Bentley).
 */
export function tituloPrincipalCardLeilaoBem(opts: {
  marcaVeiculo?: string | null;
  modelo?: string | null;
  fallback?: string;
}): string {
  const marca = marcaLeilaoItemLabel(opts.marcaVeiculo);
  if (marca) return marca;
  const m = String(opts.modelo ?? "").trim();
  if (m) return m;
  return String(opts.fallback ?? "Bem de leilão");
}

/** Texto sob “Informações do veículo”: prioriza modelo. */
export function veiculoLinhaInformacoes(opts: { marcaVeiculo?: string | null; modelo?: string | null }): string {
  const mod = String(opts.modelo ?? "").trim();
  if (mod) return mod;
  return marcaLeilaoItemLabel(opts.marcaVeiculo) || "-";
}

/** Página de detalhe: “Marca Modelo”. */
export function tituloCompletoBemLeilao(opts: { marcaVeiculo?: string | null; modelo?: string | null }): string {
  const marca = marcaLeilaoItemLabel(opts.marcaVeiculo);
  const mod = String(opts.modelo ?? "").trim();
  const parts = [marca, mod].filter(Boolean);
  return parts.join(" ") || "Item de leilão";
}
