import { addDays } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";
import { auctionItems } from "@/data/auction-items";
import type { AuctionItem, AuctionStatus } from "@/data/auction-items";
import type { LeilaoAdmin } from "@/data/leiloes-admin";
import { LEILOES_ADMIN_SEED } from "@/data/leiloes-admin";
import type { LeilaoPainelResponse as LeilaoPainelApiResponse, StatusItemLeilaoApi } from "@/lib/repositories/types/leilao.types";
import { SAO_PAULO_IANA } from "@/lib/sao-paulo-datetime";

/** Seed usado no painel admin quando o ID da rota não existe no mock (ex.: leilão vindo da API). Até existir GET /admin/leiloes/{id}/painel. */
export const ADMIN_LEILAO_PAINEL_MOCK_ID = "lei-ev-cerrado-2025" as const;

export function getLeilaoAdminById(id: string): LeilaoAdmin | undefined {
  return LEILOES_ADMIN_SEED.find((l) => l.id === id);
}

/**
 * Resolve qual ID do seed alimenta o painel: o da URL se existir em `LEILOES_ADMIN_SEED`,
 * senão o mock padrão (tela sempre demonstrativa até integrar a API).
 */
export function resolveLeilaoPainelSeedId(routeId: string): {
  seedId: string;
  isDemoFallback: boolean;
} {
  if (getLeilaoAdminById(routeId)) {
    return { seedId: routeId, isDemoFallback: false };
  }
  return { seedId: ADMIN_LEILAO_PAINEL_MOCK_ID, isDemoFallback: true };
}

export function getLotesByLeilaoId(leilaoId: string): AuctionItem[] {
  return auctionItems.filter((a) => a.leilaoId === leilaoId);
}

function shortName(full?: string | null): string {
  const base = (full ?? "").trim();
  if (!base) return "Usuário";
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return `${parts[0].slice(0, 4)}***`;
  return `${parts[0]} ${parts[parts.length - 1].slice(0, 1)}***`;
}

function toStableNumberId(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h) + 1;
}

function statusItemToAuctionStatus(status: StatusItemLeilaoApi): AuctionStatus {
  if (status === "ABERTO") return "ABERTO";
  if (status === "AGUARDANDO_ABERTURA") return "EM_BREVE";
  return "ENCERRADO";
}

/** Mais recente primeiro. Com `instanteIso` (API), usa data real; no mock, `id` menor = mais recente. */
function sortHistoricoLancesPorInstante(
  entries: NonNullable<AuctionItem["historicoLances"]>,
): NonNullable<AuctionItem["historicoLances"]> {
  return [...entries].sort((a, b) => {
    const ta = a.instanteIso != null ? new Date(a.instanteIso).getTime() : Number.NaN;
    const tb = b.instanteIso != null ? new Date(b.instanteIso).getTime() : Number.NaN;
    if (!Number.isNaN(ta) && !Number.isNaN(tb) && ta !== tb) {
      return tb - ta;
    }
    return a.id - b.id;
  });
}

function statusLeilaoToAuctionStatus(status: string): AuctionStatus {
  const s = String(status).toUpperCase();
  if (s === "ABERTO" || s === "AO_VIVO") return "ABERTO";
  if (s === "EM_BREVE") return "EM_BREVE";
  return "ENCERRADO";
}

function formatInstantAsPainelLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const today = formatInTimeZone(new Date(), SAO_PAULO_IANA, "yyyy-MM-dd");
  const day = formatInTimeZone(d, SAO_PAULO_IANA, "yyyy-MM-dd");
  const hhmm = formatInTimeZone(d, SAO_PAULO_IANA, "HH:mm");
  if (day === today) return `Hoje às ${hhmm}`;

  const amanha = formatInTimeZone(addDays(new Date(), 1), SAO_PAULO_IANA, "yyyy-MM-dd");
  if (day === amanha) return `Amanhã às ${hhmm}`;

  return `${formatInTimeZone(d, SAO_PAULO_IANA, "dd/MM")} às ${hhmm}`;
}

export function mapPainelApiToAdminPanel(painel: LeilaoPainelApiResponse): {
  leilao: LeilaoAdmin;
  lotes: AuctionItem[];
} {
  const historyByKey = new Map<string, AuctionItem["historicoLances"]>();
  for (const a of painel.atividadesRecentes ?? []) {
    if (String(a.acao).toUpperCase() !== "NOVO_LANCE" || a.valor == null) continue;
    const key = `${a.loteCodigo}::${a.nomeBem}`;
    const list = historyByKey.get(key) ?? [];
    list.push({
      id: toStableNumberId(`${key}-${a.dataHora}-${a.usuarioNome ?? ""}-${a.valor}`),
      usuario: shortName(a.usuarioNome),
      valor: formatBrl(Number(a.valor)),
      data: formatInTimeZone(new Date(a.dataHora), SAO_PAULO_IANA, "HH:mm:ss"),
      instanteIso: a.dataHora,
    });
    historyByKey.set(key, list);
  }

  const lotes: AuctionItem[] = (painel.itens ?? []).map((item) => {
    const key = `${item.codigoLote}::${item.nomeBem}`;
    const historico = sortHistoricoLancesPorInstante(historyByKey.get(key) ?? []);
    const status = statusItemToAuctionStatus(item.status);
    return {
      id: toStableNumberId(item.leilaoLoteBemId),
      leilaoId: painel.leilaoId,
      titulo: item.nomeBem,
      lote: `Lote ${item.codigoLote}`,
      categoria: "Bem",
      local: painel.cidade ?? "Online",
      veiculo: item.nomeBem,
      ano: "-",
      km: "-",
      cambio: "-",
      combustivel: "-",
      condicao: "-",
      dataAbertura: formatInstantAsPainelLabel(item.aberturaDisputa),
      dataEncerramento: formatInstantAsPainelLabel(item.encerramentoDisputa),
      lanceInicial: formatBrl(Number(item.valorInicial ?? 0)),
      lanceAtual: item.valorAtual != null ? formatBrl(Number(item.valorAtual)) : undefined,
      status,
      incrementoMinimo: Number(item.proximoLance != null && item.valorAtual != null
        ? Math.max(1, Number(item.proximoLance) - Number(item.valorAtual))
        : 100),
      historicoLances: historico,
    };
  });

  const leilao: LeilaoAdmin = {
    id: painel.leilaoId,
    titulo: painel.titulo,
    linkLive: painel.linkLive ?? null,
    modalidade: String(painel.formato).toUpperCase() === "ONLINE" ? "online" : "presencial",
    local: painel.cidade ?? "Online",
    dataAbertura:
      lotes.length > 0
        ? lotes
            .map((l) => l.dataAbertura)
            .sort((a, b) => a.localeCompare(b))[0] ?? "-"
        : "-",
    dataEncerramento: formatInstantAsPainelLabel(painel.encerramentoLeilao),
    status: statusLeilaoToAuctionStatus(painel.status),
    leiloeiroNome: painel.leiloeiro,
    totalLotes: painel.stats?.totalLotesCatalogo ?? lotes.length,
    lotesAoVivo: lotes.filter((l) => l.status === "ABERTO").length,
    totalLances: painel.stats?.totalLances ?? 0,
    pautaSequencial: true,
  };

  return { leilao, lotes };
}

export function parseBrl(value: string): number {
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
}

export function formatBrl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function aggregateLotesPorStatus(lotes: AuctionItem[]): Record<AuctionStatus, number> {
  const r: Record<AuctionStatus, number> = { ABERTO: 0, EM_BREVE: 0, ENCERRADO: 0 };
  for (const l of lotes) {
    r[l.status] += 1;
  }
  return r;
}

/**
 * Interpreta `dataEncerramento` do **bem** (item) para um instante UTC.
 * Suporta "Hoje às HH:MM" e "Amanhã às HH:MM" no calendário/relógio de **São Paulo** (não no fuso do navegador).
 */
export function parseItemEncerramentoEnd(dataEncerramento: string): Date | null {
  const tz = SAO_PAULO_IANA;
  const hoje = dataEncerramento.match(/Hoje\s+às\s+(\d{1,2}):(\d{2})/i);
  if (hoje) {
    const day = formatInTimeZone(new Date(), tz, "yyyy-MM-dd");
    const hh = String(parseInt(hoje[1], 10)).padStart(2, "0");
    const mm = hoje[2];
    return toDate(`${day}T${hh}:${mm}:00`, { timeZone: tz });
  }
  const amanha = dataEncerramento.match(/Amanhã\s+às\s+(\d{1,2}):(\d{2})/i);
  if (amanha) {
    const todayStr = formatInTimeZone(new Date(), tz, "yyyy-MM-dd");
    const noonSp = toDate(`${todayStr}T12:00:00`, { timeZone: tz });
    const tomorrowStr = formatInTimeZone(addDays(noonSp, 1), tz, "yyyy-MM-dd");
    const hh = String(parseInt(amanha[1], 10)).padStart(2, "0");
    const mm = amanha[2];
    return toDate(`${tomorrowStr}T${hh}:${mm}:00`, { timeZone: tz });
  }
  return null;
}

/** Encerramento do evento (leilão) — mesmo parser de texto de data/hora. */
export function parseHojeEncerramentoEnd(dataEncerramento: string): Date | null {
  return parseItemEncerramentoEnd(dataEncerramento);
}

export function formatMsAsCountdown(ms: number): string {
  if (ms <= 0) return "Encerrado";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m.toString().padStart(2, "0")}m`;
  return `${h}h ${m.toString().padStart(2, "0")}m ${sec.toString().padStart(2, "0")}s`;
}

/**
 * Na pauta sequencial, o bem "em pauta" é o de menor horário de encerramento entre os abertos
 * cujo prazo ainda não passou (simula um bem após o outro).
 * Na paralela, retorna null (todos os abertos são equivalentes; use countdown por bem).
 */
export function getBemEmPautaId(
  lotes: AuctionItem[],
  pautaSequencial: boolean,
  nowMs: number
): number | null {
  if (!pautaSequencial) return null;
  const abertos = lotes.filter((l) => l.status === "ABERTO");
  if (abertos.length === 0) return null;

  const withEnd = abertos
    .map((item) => {
      const end = parseItemEncerramentoEnd(item.dataEncerramento);
      return end ? { item, end } : null;
    })
    .filter((x): x is { item: AuctionItem; end: Date } => x !== null);

  if (withEnd.length === 0) return abertos[0].id;

  withEnd.sort((a, b) => a.end.getTime() - b.end.getTime());
  const current = withEnd.find((x) => nowMs < x.end.getTime());
  return current?.item.id ?? null;
}

/** Lance mais recente no histórico (usado como provável ganhador após encerramento). */
export function getUltimoLanceParaArrematacao(item: AuctionItem): { usuario: string; valor: string } | null {
  const h = item.historicoLances;
  if (!h?.length) return null;
  const sorted = sortHistoricoLancesPorInstante(h);
  return { usuario: sorted[0].usuario, valor: sorted[0].valor };
}

export type FeedLine = { id: string; text: string; time: string; instanteMs?: number };

export function buildHistoricoFeedInicial(lotes: AuctionItem[]): FeedLine[] {
  const rows: FeedLine[] = [];
  for (const lot of lotes) {
    const h = sortHistoricoLancesPorInstante(lot.historicoLances ?? []);
    if (!h.length) continue;
    for (const ev of h) {
      const instanteMs =
        ev.instanteIso != null ? new Date(ev.instanteIso).getTime() : undefined;
      rows.push({
        id: `${lot.id}-${ev.id}`,
        text: `${lot.lote} · ${ev.usuario} — ${ev.valor}`,
        time: ev.data,
        instanteMs,
      });
    }
  }
  rows.sort((a, b) => {
    const ma = a.instanteMs ?? 0;
    const mb = b.instanteMs ?? 0;
    if (ma !== mb) return mb - ma;
    return b.id.localeCompare(a.id);
  });
  return rows.slice(0, 14);
}
