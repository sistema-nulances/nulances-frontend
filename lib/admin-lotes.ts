import { LEILOES_ADMIN_SEED } from "@/data/leiloes-admin";
import type { LoteAdmin, LoteAdminStatus } from "@/data/lotes-admin";

const leilaoTituloById = new Map(LEILOES_ADMIN_SEED.map((l) => [l.id, l.titulo]));

export function leilaoTituloParaLote(leilaoId: string | null): string | null {
  if (!leilaoId) return null;
  return leilaoTituloById.get(leilaoId) ?? leilaoId;
}

/** Próximo código no formato `Lote N` (N numérico), com base nos lotes existentes. Mock / front-only. */
export function proximoCodigoLoteAdmin(lotes: LoteAdmin[]): string {
  let max = 0;
  for (const l of lotes) {
    const m = /^Lote\s+(\d+)$/i.exec(l.codigo.trim());
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `Lote ${max + 1}`;
}

/** Rascunho de novo lote antes do POST `/admin/lotes` (código vem da API). */
export function novoLoteAdminPlaceholder(): LoteAdmin {
  return {
    id: `draft-lote-${Date.now()}`,
    codigo: "",
    titulo: "",
    status: "disponivel",
    leilaoId: null,
    itens: [],
  };
}

export function isDraftLoteId(id: string): boolean {
  return id.startsWith("draft-lote");
}

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export type LoteStatusFilter = "todos" | LoteAdminStatus;

export function buildLoteAdminStats(lotes: LoteAdmin[]) {
  let totalBens = 0;
  let disponivel = 0;
  let emLeilao = 0;
  let encerrado = 0;
  for (const l of lotes) {
    totalBens += l.itens.length;
    if (l.status === "disponivel") disponivel += 1;
    else if (l.status === "em_leilao") emLeilao += 1;
    else encerrado += 1;
  }
  return {
    totalLotes: lotes.length,
    totalBens,
    disponivel,
    emLeilao,
    encerrado,
  };
}

export function filterLotesAdmin(
  lotes: LoteAdmin[],
  statusTab: LoteStatusFilter,
  search: string
): LoteAdmin[] {
  let list =
    statusTab === "todos" ? lotes : lotes.filter((l) => l.status === statusTab);
  const q = normalize(search);
  if (!q) return list;
  return list.filter((l) => {
    const leilao = leilaoTituloParaLote(l.leilaoId) ?? "";
    const itensHay = l.itens.map((i) => `${i.nome} ${i.categoria ?? ""} ${i.descricao ?? ""}`).join(" ");
    const hay = normalize(
      `${l.codigo} ${l.titulo} ${l.observacoes ?? ""} ${leilao} ${itensHay} ${l.id} ${l.status}`
    );
    return hay.includes(q);
  });
}
