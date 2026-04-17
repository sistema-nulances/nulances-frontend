"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft01Icon,
  AuctionIcon,
  Clock01Icon,
  LegalHammerIcon,
  Location01Icon,
  PackageIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { AuctionItem } from "@/data/auction-items";
import type { LeilaoAdmin } from "@/data/leiloes-admin";

function leilaoLocalLinha(leilao: LeilaoAdmin): string {
  if (leilao.modalidade === "online") return "Online";
  return leilao.local;
}
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminMetricTile } from "@/components/admin/dashboard/admin-metric-tile";
import {
  aggregateLotesPorStatus,
  buildHistoricoFeedInicial,
  formatBrl,
  formatMsAsCountdown,
  getBemEmPautaId,
  getUltimoLanceParaArrematacao,
  parseHojeEncerramentoEnd,
  parseItemEncerramentoEnd,
  type FeedLine,
} from "@/lib/admin-leilao-panel";
import { formatRelogioHmsSaoPaulo } from "@/lib/sao-paulo-datetime";
import { getStatusLabel } from "@/utils/status-auction";
import { cn } from "@/lib/cn";

const ARREMATACAO_MS = 12_000;
const ARREMAT_STORAGE_KEY = (itemId: number) => `nul-admin-arrem-v1-${itemId}`;

type ArrematacaoFase = "ativo" | "processando" | "definido";

function useArrematacaoFase(item: AuctionItem, nowMs: number): ArrematacaoFase {
  const endBem = React.useMemo(() => parseItemEncerramentoEnd(item.dataEncerramento), [item.dataEncerramento]);
  const tempoEncerrado = Boolean(endBem && endBem.getTime() <= nowMs);
  const key = ARREMAT_STORAGE_KEY(item.id);

  const [fase, setFase] = React.useState<ArrematacaoFase>(() => {
    if (typeof window === "undefined") return "ativo";
    if (item.status === "ENCERRADO") return "definido";
    if (sessionStorage.getItem(key) === "1") return "definido";
    const end = parseItemEncerramentoEnd(item.dataEncerramento);
    if (end && end.getTime() <= Date.now() && item.status === "ABERTO") return "processando";
    return "ativo";
  });

  React.useEffect(() => {
    if (!tempoEncerrado) {
      setFase("ativo");
      return;
    }
    if (item.status === "ENCERRADO") {
      setFase("definido");
      return;
    }
    if (typeof window !== "undefined" && sessionStorage.getItem(key) === "1") {
      setFase("definido");
      return;
    }
    setFase("processando");
    const t = window.setTimeout(() => {
      setFase("definido");
      sessionStorage.setItem(key, "1");
    }, ARREMATACAO_MS);
    return () => window.clearTimeout(t);
  }, [tempoEncerrado, item.status, item.id, key]);

  return fase;
}

function statusBadgeVariant(
  status: LeilaoAdmin["status"]
): React.ComponentProps<typeof Badge>["variant"] {
  if (status === "ABERTO") return "emerald";
  if (status === "EM_BREVE") return "amber";
  return "zinc";
}

function useCountdownEncerramento(leilao: LeilaoAdmin) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const end = React.useMemo(
    () => parseHojeEncerramentoEnd(leilao.dataEncerramento),
    [leilao.dataEncerramento]
  );
  if (!end) {
    return { label: leilao.dataEncerramento as string, live: false };
  }
  const ms = end.getTime() - now;
  if (ms <= 0) {
    return { label: "Encerrado", live: true };
  }
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return {
    label: `${h}h ${m.toString().padStart(2, "0")}m ${sec.toString().padStart(2, "0")}s`,
    live: true,
  };
}

function useActivityFeed(lotes: AuctionItem[]) {
  return React.useMemo<FeedLine[]>(() => buildHistoricoFeedInicial(lotes), [lotes]);
}

function LotePainelRow({
  item,
  nowMs,
  bemEmPautaId,
}: {
  item: AuctionItem;
  nowMs: number;
  bemEmPautaId: number | null;
}) {
  const status = item.status;
  const arrematacaoFase = useArrematacaoFase(item, nowMs);
  const bid = item.lanceAtual ?? item.lanceInicial;

  const endBem = React.useMemo(() => parseItemEncerramentoEnd(item.dataEncerramento), [item.dataEncerramento]);
  const tempoEncerrado = Boolean(endBem && endBem.getTime() <= nowMs);
  const msParaEncerrarBem = endBem ? endBem.getTime() - nowMs : null;
  const countdownBem = msParaEncerrarBem != null ? formatMsAsCountdown(msParaEncerrarBem) : null;
  const urgente =
    arrematacaoFase === "ativo" &&
    msParaEncerrarBem != null &&
    msParaEncerrarBem > 0 &&
    msParaEncerrarBem < 5 * 60 * 1000;

  const ganhador = React.useMemo(() => getUltimoLanceParaArrematacao(item), [item]);

  const filaBadge = (() => {
    if (status !== "ABERTO" || arrematacaoFase !== "ativo") return null;
    if (bemEmPautaId === null) {
      return (
        <Badge variant="amber" size="sm">
          Aguardando pauta
        </Badge>
      );
    }
    if (bemEmPautaId === item.id) {
      return (
        <Badge variant="purple" size="sm">
          Em pauta
        </Badge>
      );
    }
    return (
      <Badge variant="zinc" size="sm">
        Na fila
      </Badge>
    );
  })();

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-white p-4",
        arrematacaoFase === "processando" && "border-amber-300 bg-amber-50/20",
        status === "ABERTO" &&
          arrematacaoFase === "ativo" &&
          bemEmPautaId === item.id &&
          "border-[var(--nulance-purple)]/40 bg-[var(--nulance-purple)]/[0.04]",
        status === "ABERTO" &&
          arrematacaoFase === "ativo" &&
          bemEmPautaId !== null &&
          bemEmPautaId !== item.id &&
          "border-dashed border-zinc-300 bg-zinc-50/50",
        status === "ABERTO" && arrematacaoFase === "ativo" && bemEmPautaId === null && "border-amber-200 bg-amber-50/30",
        (status !== "ABERTO" || arrematacaoFase === "definido") && arrematacaoFase !== "processando" && "border-zinc-200"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{item.lote}</p>
          <p className="mt-0.5 text-[15px] font-bold leading-snug text-zinc-900">{item.titulo}</p>
          <p className="mt-1 text-[12px] text-zinc-500">{item.local}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {arrematacaoFase === "processando" ? (
            <Badge variant="amber" size="sm">
              Processando arrematação
            </Badge>
          ) : null}
          {filaBadge}
          {arrematacaoFase === "processando" ? null : arrematacaoFase === "definido" && status === "ABERTO" ? (
            <Badge variant="purple" size="sm">
              Arrematado
            </Badge>
          ) : (
            <Badge
              variant={status === "ABERTO" ? "emerald" : status === "EM_BREVE" ? "amber" : "zinc"}
              size="sm"
            >
              {getStatusLabel(status)}
            </Badge>
          )}
        </div>
      </div>

      <div
        className={cn(
          "border-t border-zinc-100 pt-3",
          urgente && "border-amber-200/90",
          arrematacaoFase === "processando" && "border-amber-200/70"
        )}
      >
        {arrematacaoFase === "processando" ? (
          <div className="flex items-start gap-2.5">
            <Skeleton className="mt-1 h-4 w-4 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                Arrematação
              </p>
              <p className="mt-1 text-lg font-bold text-zinc-900">Processando</p>
              <p className="mt-1 text-[12px] leading-snug text-zinc-600">
                Validando lances e definindo o ganhador. Isso pode levar alguns instantes.
              </p>
            </div>
          </div>
        ) : arrematacaoFase === "definido" ? (
          <div className="flex items-start gap-2.5">
            <HugeiconsIcon
              icon={AuctionIcon}
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--nulance-purple)]"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Ganhador
              </p>
              {ganhador ? (
                <>
                  <p className="mt-1 text-[15px] font-semibold text-zinc-900">{ganhador.usuario}</p>
                  <p className="mt-0.5 text-sm font-bold tabular-nums text-zinc-900">{ganhador.valor}</p>
                </>
              ) : (
                <p className="mt-1 text-[13px] text-zinc-600">Definido — aguardando publicação do nome do arrematante.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5">
            <HugeiconsIcon
              icon={Clock01Icon}
              className={cn("mt-0.5 h-4 w-4 shrink-0", urgente ? "text-amber-600" : "text-[var(--nulance-purple)]")}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Encerramento deste bem
              </p>
              <p
                className={cn(
                  "mt-1 text-xl font-bold tabular-nums tracking-tight text-zinc-900",
                  urgente && "text-amber-900"
                )}
              >
                {countdownBem ?? item.dataEncerramento}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-zinc-500">
                {endBem ? `No catálogo: ${item.dataEncerramento}` : `Horário: ${item.dataEncerramento}`}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-2 border-t border-zinc-100 pt-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            {status === "ABERTO" ? "Lance atual" : arrematacaoFase === "definido" ? "Lance vencedor" : "Referência"}
          </p>
          <p className="text-[15px] font-bold tabular-nums text-zinc-900">
            {arrematacaoFase === "definido" && ganhador ? ganhador.valor : bid}
          </p>
        </div>
        <Link
          href={`/auction/${item.id}`}
          className="text-[12px] font-semibold text-[var(--nulance-purple)] underline decoration-[var(--nulance-purple)]/40 underline-offset-2 hover:decoration-[var(--nulance-purple)]"
        >
          Ver página pública
        </Link>
      </div>
    </div>
  );
}

export function LeilaoLivePanel({ leilao, lotes }: { leilao: LeilaoAdmin; lotes: AuctionItem[] }) {
  const countdown = useCountdownEncerramento(leilao);
  const feed = useActivityFeed(lotes);
  const porStatus = React.useMemo(() => aggregateLotesPorStatus(lotes), [lotes]);
  const [clock, setClock] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = window.setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const bemEmPautaId = React.useMemo(() => getBemEmPautaId(lotes, true, clock), [lotes, clock]);
  const bemEmPauta = React.useMemo(
    () => (bemEmPautaId != null ? lotes.find((l) => l.id === bemEmPautaId) ?? null : null),
    [bemEmPautaId, lotes]
  );
  const encerraBemEmPauta = React.useMemo(() => {
    if (!bemEmPauta) return null;
    const end = parseItemEncerramentoEnd(bemEmPauta.dataEncerramento);
    if (!end) return null;
    return formatMsAsCountdown(end.getTime() - clock);
  }, [bemEmPauta, clock]);

  const updatedAt = formatRelogioHmsSaoPaulo(new Date(clock));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/leiloes"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--nulance-purple)] hover:underline"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
            Voltar aos leilões
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] font-bold leading-tight text-zinc-900">{leilao.titulo}</h1>
            <Badge variant={statusBadgeVariant(leilao.status)} size="sm">
              {getStatusLabel(leilao.status)}
            </Badge>
            {leilao.status === "ABERTO" ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Ao vivo
              </span>
            ) : null}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
            <HugeiconsIcon icon={Location01Icon} className="h-4 w-4 shrink-0" />
            {leilaoLocalLinha(leilao)}
            <span className="text-zinc-300">·</span>
            <span className="inline-flex items-center gap-1">
              <HugeiconsIcon icon={LegalHammerIcon} className="h-4 w-4 text-zinc-400" />
              {leilao.leiloeiroNome}
            </span>
          </p>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-500">
            Pauta sequencial: os bens entram um após o outro; o encerramento do evento é o teto geral. O tempo
            crítico para cada bem é o dele, não o do lote como rótulo genérico.
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Painel em tempo real · atualizado às {updatedAt}
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:max-w-sm sm:shrink-0">
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Encerramento geral do evento
            </p>
            <p className="mt-0.5 text-[11px] text-zinc-400">Prazo máximo do leilão (todos os bens)</p>
            <p className="mt-2 text-xl font-bold tabular-nums text-zinc-900">{countdown.label}</p>
          </div>
          {bemEmPauta && encerraBemEmPauta ? (
            <div className="rounded-2xl border border-[var(--nulance-purple)]/30 bg-[var(--nulance-purple)]/[0.06] px-4 py-3 text-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nulance-purple)]">
                Bem em pauta agora
              </p>
              <p className="mt-1 text-[13px] font-semibold leading-snug text-zinc-900">{bemEmPauta.titulo}</p>
              <p className="text-[11px] text-zinc-500">{bemEmPauta.lote}</p>
              <p className="mt-2 text-xs text-zinc-500">Este bem encerra em</p>
              <p className="text-xl font-bold tabular-nums text-[var(--nulance-purple)]">{encerraBemEmPauta}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[12px] text-zinc-600">
              Nenhum bem em pauta no momento.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminMetricTile
          label="Lotes neste catálogo"
          value={lotes.length}
          icon={PackageIcon}
          accent="purple"
        />
        <AdminMetricTile
          label="Em disputa agora"
          value={porStatus.ABERTO}
          icon={AuctionIcon}
          accent="emerald"
        />
        <AdminMetricTile
          label="Total de lances"
          value={leilao.totalLances ?? 0}
          icon={LegalHammerIcon}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 border-t border-zinc-100 pt-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Bens em leilão</h2>
              <p className="mt-0.5 text-[12px] text-zinc-500">
                Cada cartão é um bem; o cronômetro é o encerramento daquele bem, não o fim do evento inteiro.
              </p>
            </div>
            <span className="shrink-0 text-xs text-zinc-500">
              {porStatus.ABERTO} abertos · {porStatus.EM_BREVE} em breve · {porStatus.ENCERRADO} encerrados
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {lotes.map((item) => (
              <LotePainelRow key={item.id} item={item} nowMs={clock} bemEmPautaId={bemEmPautaId} />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-base font-bold text-zinc-900">Atividade recente</h2>
          </div>
          <div className="max-h-[min(520px,70vh)] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-3 custom-scrollbar">
            <ul className="space-y-0 divide-y divide-zinc-100">
              {feed.length === 0 ? (
                <li className="py-8 text-center text-sm text-zinc-500">
                  Sem histórico de lances neste catálogo.
                </li>
              ) : (
                feed.map((line) => (
                  <li key={line.id} className="py-2.5 first:pt-0">
                    <p className="text-[13px] leading-snug text-zinc-800">{line.text}</p>
                    <p className="mt-1 text-[11px] text-zinc-400">{line.time}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
