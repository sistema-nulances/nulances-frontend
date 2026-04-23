import type { AuctionStatus } from "@/data/auction-items";
import type { LeilaoAdmin, LeilaoAgendaBem, LeilaoModalidade } from "@/data/leiloes-admin";
import type { LeilaoResponse } from "@/lib/repositories/types/leilao.types";
import { formatDateTimePtBrSaoPaulo } from "@/lib/sao-paulo-datetime";

export type LeilaoStatusFilter = "todos" | AuctionStatus;

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function buildLeilaoStats(rows: LeilaoAdmin[]) {
  const porStatus: Record<AuctionStatus, number> = {
    ABERTO: 0,
    EM_BREVE: 0,
    ENCERRADO: 0,
  };
  for (const r of rows) {
    porStatus[r.status] += 1;
  }
  return { total: rows.length, porStatus };
}

export function filterLeiloes(
  rows: LeilaoAdmin[],
  statusFilter: LeilaoStatusFilter,
  search: string
): LeilaoAdmin[] {
  let list =
    statusFilter === "todos" ? rows : rows.filter((r) => r.status === statusFilter);
  const q = normalize(search);
  if (!q) return list;
  return list.filter((r) => {
    const hay = normalize(
      `${r.titulo} ${r.local} ${r.leiloeiroNome} ${r.comitenteNome ?? ""} ${r.id}`
    );
    return hay.includes(q);
  });
}

export function deriveLeilaoStatus(eventStart: Date, eventEnd: Date, now = new Date()): AuctionStatus {
  if (now < eventStart) return "EM_BREVE";
  if (now > eventEnd) return "ENCERRADO";
  return "ABERTO";
}

/** Texto curto para exibição em cards (sempre em horário de São Paulo). */
export function formatLeilaoDataLegivel(d: Date): string {
  return formatDateTimePtBrSaoPaulo(d);
}

export type NovoLeilaoPayload = {
  titulo: string;
  linkLive?: string | null;
  local: string;
  leiloeiroNome: string;
  comitenteId: string;
  comitenteNome: string;
  modalidade: LeilaoModalidade;
  eventoInicio: Date;
  eventoFim: Date;
  agendaBens: LeilaoAgendaBem[];
};

export function buildLeilaoAdminFromNovo(payload: NovoLeilaoPayload, id: string): LeilaoAdmin {
  const {
    titulo,
    linkLive,
    local,
    leiloeiroNome,
    comitenteId,
    comitenteNome,
    modalidade,
    eventoInicio,
    eventoFim,
    agendaBens,
  } = payload;
  const status = deriveLeilaoStatus(eventoInicio, eventoFim);
  const n = agendaBens.length;
  const abertos =
    status === "ABERTO"
      ? agendaBens.filter((a) => {
          const t = Date.now();
          return t >= new Date(a.aberturaIso).getTime() && t <= new Date(a.encerramentoIso).getTime();
        }).length
      : 0;

  return {
    id,
    titulo: titulo.trim(),
    linkLive: linkLive?.trim() || null,
    local: local.trim(),
    modalidade,
    dataAbertura: formatLeilaoDataLegivel(eventoInicio),
    dataEncerramento: formatLeilaoDataLegivel(eventoFim),
    status,
    leiloeiroNome,
    comitenteId: comitenteId.trim() || undefined,
    comitenteNome: comitenteNome.trim() || undefined,
    totalLotes: n,
    lotesAoVivo: abertos,
    pautaSequencial: true,
    agendaBens,
  };
}

export function newLeilaoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `lei-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  return `lei-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatoLeilaoApiParaUi(formato: string | undefined | null): LeilaoModalidade {
  return String(formato ?? "").toUpperCase() === "ONLINE" ? "online" : "presencial";
}

export function statusLeilaoApiParaUi(status: string | undefined | null): AuctionStatus {
  const s = String(status ?? "").toUpperCase();
  if (s === "EM_LEILAO" || s === "ABERTO" || s === "AO_VIVO") return "ABERTO";
  if (s === "ENCERRADO") return "ENCERRADO";
  return "EM_BREVE";
}

export function leilaoResponseParaAdmin(
  r: LeilaoResponse,
  leiloeiroNome: string,
  comitenteNome: string
): LeilaoAdmin {
  const lotes = r.lotes ?? [];
  const lotesAoVivo = lotes.filter((l) =>
    (l.bens ?? []).some((b) => {
      const now = Date.now();
      const a = new Date(b.aberturaDisputa).getTime();
      const e = new Date(b.encerramentoDisputa).getTime();
      return now >= a && now <= e;
    })
  ).length;

  return {
    id: r.id,
    titulo: r.titulo,
    linkLive: r.linkLive ?? null,
    local:
      formatoLeilaoApiParaUi(r.formato) === "online"
        ? "Online"
        : [r.cidade, r.endereco].filter(Boolean).join(" - ") || r.cidade || "—",
    modalidade: formatoLeilaoApiParaUi(r.formato),
    dataAbertura: formatDateTimePtBrSaoPaulo(new Date(r.inicioLeilao)),
    dataEncerramento: formatDateTimePtBrSaoPaulo(new Date(r.fimLeilao)),
    status: statusLeilaoApiParaUi(r.status),
    leiloeiroNome,
    comitenteId: r.comitenteId,
    comitenteNome,
    totalLotes: lotes.length,
    lotesAoVivo,
    pautaSequencial: true,
    agendaBens: [],
  };
}
