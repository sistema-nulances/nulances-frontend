import type { LoteBemItem, LoteAdmin, LoteAdminStatus } from "@/data/lotes-admin";
import type { LoteListResponse, LoteResponse } from "@/lib/repositories/types/lote.types";

export function statusLoteApiParaUi(status: string | undefined | null): LoteAdminStatus {
  const u = (status ?? "").toUpperCase();
  if (u === "DISPONIVEL") return "disponivel";
  if (u === "EM_LEILAO") return "em_leilao";
  if (u === "ENCERRADO") return "encerrado";
  return "disponivel";
}

function itensAPartirDeBemIds(
  bemIds: string[] | undefined,
  catalogoPorId: Map<string, LoteBemItem>
): LoteBemItem[] {
  const ids = bemIds ?? [];
  return ids.map((id) => {
    const b = catalogoPorId.get(id);
    if (b) return b;
    return { id, nome: `Bem ${id.slice(0, 8)}…` };
  });
}

function itensPlaceholderPorQuantidade(
  loteId: string,
  quantidade: number | undefined
): LoteBemItem[] {
  const total = Math.max(0, quantidade ?? 0);
  return Array.from({ length: total }, (_, idx) => ({
    id: `placeholder-${loteId}-${idx + 1}`,
    nome: `Bem catalogado ${idx + 1}`,
  }));
}

export function loteResponseParaAdmin(
  r: LoteResponse,
  catalogoPorId: Map<string, LoteBemItem>
): LoteAdmin {
  return {
    id: r.id,
    codigo: r.codigo,
    titulo: r.nome,
    observacoes: r.observacoes ?? undefined,
    status: statusLoteApiParaUi(r.status),
    leilaoId: r.leilaoId ?? null,
    itens: itensAPartirDeBemIds(r.bemIds, catalogoPorId),
  };
}

export function loteListResponseParaAdmin(
  r: LoteListResponse,
  catalogoPorId: Map<string, LoteBemItem>
): LoteAdmin {
  const itens =
    r.bemIds && r.bemIds.length > 0
      ? itensAPartirDeBemIds(r.bemIds, catalogoPorId)
      : itensPlaceholderPorQuantidade(r.id, r.totalBens ?? r.quantidadeBens);

  return {
    id: r.id,
    codigo: r.codigo,
    titulo: r.nome,
    observacoes: r.observacoes ?? undefined,
    status: statusLoteApiParaUi(r.status),
    leilaoId: r.leilaoId ?? r.nomeLeilao ?? null,
    itens,
  };
}
