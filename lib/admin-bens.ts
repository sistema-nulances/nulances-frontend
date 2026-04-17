import type { LoteBemItem } from "@/data/lotes-admin";

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export type BemCategoriaFilter = "todos" | string;

export function nextBemAdminId(items: LoteBemItem[]): string {
  let max = 0;
  for (const i of items) {
    const m = /^bem-adm-(\d+)$/i.exec(i.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `bem-adm-${max + 1}`;
}

export function categoriasFromItems(items: LoteBemItem[]): string[] {
  const s = new Set<string>();
  for (const i of items) {
    const c = (i.categoria ?? i.tipoVeiculo)?.trim();
    if (c) s.add(c);
  }
  return [...s].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function buildBensStats(items: LoteBemItem[]) {
  const cats = new Set<string>();
  let sem = 0;
  for (const i of items) {
    const c = (i.categoria ?? i.tipoVeiculo)?.trim();
    if (c) cats.add(c);
    else sem++;
  }
  return {
    total: items.length,
    categorias: cats.size,
    semCategoria: sem,
  };
}

export function filterBensAdmin(
  items: LoteBemItem[],
  search: string,
  categoria: BemCategoriaFilter
): LoteBemItem[] {
  let list =
    categoria === "todos"
      ? items
      : items.filter((i) => ((i.categoria ?? i.tipoVeiculo) ?? "").trim() === categoria);
  const q = normalize(search);
  if (!q) return list;
  return list.filter((i) => {
    const hay = normalize(
      `${i.nome} ${i.marca ?? ""} ${i.categoria ?? ""} ${i.tipoVeiculo ?? ""} ${i.condicao ?? ""} ${i.descricao ?? ""} ${i.placa ?? ""} ${i.ano ?? ""} ${i.cor ?? ""} ${i.chassiFinal ?? ""} ${i.id}`
    );
    return hay.includes(q);
  });
}

export function novoBemDraft(items: LoteBemItem[]): LoteBemItem {
  return {
    id: `draft-${Date.now()}`,
    nome: "",
    modelo: "",
    categoria: undefined,
    descricao: undefined,
    tipoVeiculo: undefined,
    condicao: undefined,
    ano: undefined,
    quilometragem: undefined,
    combustivel: undefined,
    cambio: undefined,
    placa: undefined,
    blindado: false,
    chassiFinal: undefined,
    cor: undefined,
  };
}
