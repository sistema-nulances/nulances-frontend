"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AuctionIcon,
  Calendar03Icon,
  Clock01Icon,
  FilterHorizontalIcon,
  ImageNotFound01Icon,
  Location01Icon,
  Money03Icon,
  TimeQuarterPassIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetSeparator,
} from "@/components/ui/sheet";
import { useAuth } from "@/components/providers/auth-provider";
import { buscarMeusLances } from "@/lib/repositories/lances-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";
import { listarLeiloesPublicos } from "@/lib/repositories/admin-leiloes-repository";
import { BemMarcaLogo } from "@/components/admin/bens/bem-marca-logo";
import {
  marcaVeiculoCodigoDoParticipacaoItem,
  type MeuLanceParticipacaoItem,
} from "@/lib/repositories/types/lance.types";
import type { LeilaoResponse } from "@/lib/repositories/types/leilao.types";
import {
  marcaLeilaoItemLabel,
  marcaLeilaoItemLabelOuInferida,
  textoSemPrefixoMarca,
  tituloCompletoBemLeilao,
  veiculoLinhaInformacoes,
} from "@/lib/leilao-bem-exibicao";
import { getStatusClasses, getStatusLabel } from "@/utils/status-auction";
import type { AuctionStatus } from "@/data/auction-items";

function formatMoney(value?: number | null): string {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalizeOutcome(raw?: string | null): "GANHADOR" | "NAO_GANHADOR" | "EM_DISPUTA" {
  const u = String(raw ?? "").toUpperCase();
  if (u === "GANHADOR") return "GANHADOR";
  if (u === "NAO_GANHADOR") return "NAO_GANHADOR";
  return "EM_DISPUTA";
}

function toCardAuctionStatus(statusItem?: string | null): AuctionStatus {
  const s = String(statusItem ?? "").toUpperCase();
  if (s === "ABERTO" || s === "PROCESSANDO_RESULTADO") return "ABERTO";
  if (s === "AGUARDANDO_ABERTURA") return "EM_BREVE";
  return "ENCERRADO";
}

function localLabel(item: MeuLanceParticipacaoItem): string {
  const fmt = String(item.formatoLeilao ?? "").toUpperCase();
  if (fmt === "PRESENCIAL" && item.cidade?.trim()) return item.cidade.trim();
  if (item.cidade?.trim()) return item.cidade.trim();
  return "Online";
}

function vehicleFilterKey(tipo?: string | null): "MOTO" | "CARRO" | "CAMINHAO" | null {
  const t = String(tipo ?? "").toUpperCase();
  if (t === "MOTO" || t === "MOTOCICLETA") return "MOTO";
  if (t === "CARRO" || t === "AUTOMOVEL" || t === "AUTOMÓVEL") return "CARRO";
  if (t === "CAMINHAO" || t === "CAMINHÃO" || t === "CAMINHONETE") return "CAMINHAO";
  return null;
}

function tipoVeiculoLabel(tipo?: string | null): string {
  const t = String(tipo ?? "").toUpperCase();
  if (t === "MOTO" || t === "MOTOCICLETA") return "Moto";
  if (t === "CARRO" || t === "AUTOMOVEL" || t === "AUTOMÓVEL") return "Carro";
  if (t === "CAMINHAO" || t === "CAMINHÃO" || t === "CAMINHONETE") return "Caminhão";
  if (!t) return "Veículo";
  return t.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function OutcomePill({ outcome }: { outcome: "GANHADOR" | "NAO_GANHADOR" | "EM_DISPUTA" }) {
  if (outcome === "GANHADOR") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        Ganhador
      </span>
    );
  }

  if (outcome === "NAO_GANHADOR") {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">
        Não ganhador
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
      Em disputa
    </span>
  );
}

function MeusLancesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[28px] ring-1 ring-zinc-200/30">
          <div className="space-y-4 p-4 md:p-5">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
              <Skeleton className="h-8 flex-1 max-w-sm rounded-lg" />
            </div>
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="aspect-[16/10] w-full rounded-[22px]" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

type BemResumoLookup = {
  marcaVeiculo?: string | null;
  modelo?: string | null;
};

function textOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v.length > 0 ? v : null;
}

function buildBemLookup(leiloes: LeilaoResponse[]): Map<string, BemResumoLookup> {
  const out = new Map<string, BemResumoLookup>();
  for (const leilao of leiloes ?? []) {
    for (const lote of leilao.lotes ?? []) {
      for (const bem of lote.bens ?? []) {
        const key = String(bem.leilaoLoteBemId ?? "").trim();
        if (!key) continue;
        out.set(key, {
          marcaVeiculo: textOrNull(bem.marcaVeiculo),
          modelo: textOrNull(bem.modelo),
        });
      }
    }
  }
  return out;
}

function enrichWithHomeData(
  rows: MeuLanceParticipacaoItem[],
  homeLookup: Map<string, BemResumoLookup>
): MeuLanceParticipacaoItem[] {
  return rows.map((row) => {
    const fallback = homeLookup.get(String(row.leilaoLoteBemId));
    const marcaAtual = textOrNull(row.marcaVeiculo) ?? textOrNull(row.marca);
    const modeloAtual = textOrNull(row.modelo);
    const nomeBemAtual = textOrNull(row.nomeBem);

    return {
      ...row,
      marcaVeiculo: marcaAtual ?? fallback?.marcaVeiculo ?? null,
      modelo: modeloAtual ?? nomeBemAtual ?? fallback?.modelo ?? null,
      nomeBem: nomeBemAtual ?? fallback?.modelo ?? null,
    };
  });
}

function MyBidCard({ row }: { row: MeuLanceParticipacaoItem }) {
  const cardStatus = toCardAuctionStatus(row.statusItem);
  const outcome = normalizeOutcome(row.resultadoParticipacao);
  const meuValorFmt = formatMoney(row.meuValor);
  const lanceAtualFmt = formatMoney(row.valorAtual ?? row.meuValor);
  const capa = row.midiaCapaUrl?.trim() ?? "";
  const loteLabel = row.codigoLote ? `Lote ${row.codigoLote}` : "Lote";
  const marcaCodigo = marcaVeiculoCodigoDoParticipacaoItem(row);
  const modeloBruto = String(row.modelo ?? "").trim();
  const nomeBemBruto = String(row.nomeBem ?? "").trim();
  const textoPrincipalBem = modeloBruto || nomeBemBruto;
  const tituloFallbackApi = tituloCompletoBemLeilao({
    marcaVeiculo: marcaCodigo,
    modelo: textoPrincipalBem,
  });
  const nomeParaLogo = textoPrincipalBem || tituloFallbackApi;
  const rotuloMarcaDoResponse = marcaCodigo ? marcaLeilaoItemLabel(marcaCodigo) : "";
  /** Nome legível: prioriza enum do JSON (`marcaVeiculo` / `marca`); inferência só se não houver código. */
  const marcaLegivel = marcaLeilaoItemLabelOuInferida(marcaCodigo, nomeParaLogo);
  const baseModeloParaExibir = modeloBruto || nomeBemBruto;
  const modeloSemMarca = rotuloMarcaDoResponse
    ? textoSemPrefixoMarca(rotuloMarcaDoResponse, baseModeloParaExibir)
    : marcaLegivel
      ? textoSemPrefixoMarca(marcaLegivel, baseModeloParaExibir)
      : baseModeloParaExibir;
  const modeloExibir = modeloSemMarca || nomeBemBruto || modeloBruto;
  const tituloAlt =
    [marcaLegivel, modeloExibir].filter(Boolean).join(" ").trim() ||
    textoPrincipalBem ||
    tituloFallbackApi;
  const linhaInfoVeiculo = veiculoLinhaInformacoes({
    marcaVeiculo: marcaCodigo,
    modelo: textoPrincipalBem,
  });

  return (
    <Link
      href={`/auction/${encodeURIComponent(row.leilaoLoteBemId)}`}
      className="group block overflow-hidden rounded-[28px] bg-white/5 ring-1 ring-zinc-200/20 transition-all duration-300 hover:-translate-y-1 hover:ring-zinc-200/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <article className="px-4 pt-4 pb-5 md:px-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[var(--nulance-purple)]/10 px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-[var(--nulance-purple)] uppercase">
                {loteLabel}
              </span>

              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.04em] uppercase",
                  getStatusClasses(cardStatus),
                )}
              >
                {getStatusLabel(cardStatus)}
              </span>

              <OutcomePill outcome={outcome} />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <BemMarcaLogo nome={nomeParaLogo} marca={marcaCodigo} size="sm" />
              <h3 className="line-clamp-2 min-w-0 flex-1 text-lg leading-[1.12] font-semibold tracking-[-0.04em] text-zinc-950 sm:text-[24px] sm:leading-[1.08]">
                {marcaLegivel ? (
                  <>
                    <span className="text-zinc-950">{marcaLegivel}</span>
                    {modeloExibir ? (
                      <span className="font-semibold text-zinc-950">
                        {marcaLegivel ? "\u00A0" : null}
                        {modeloExibir}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span>{modeloBruto || tituloFallbackApi}</span>
                )}
              </h3>
            </div>

            {row.tituloLeilao?.trim() ? (
              <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{row.tituloLeilao}</p>
            ) : null}

            <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
              <HugeiconsIcon icon={Location01Icon} size={16} color="currentColor" strokeWidth={1.9} />
              <span className="truncate">{localLabel(row)}</span>
            </div>
          </div>

          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 sm:flex">
            <HugeiconsIcon icon={AuctionIcon} size={18} color="currentColor" strokeWidth={1.9} />
          </div>
        </div>

        <div className="overflow-hidden rounded-[22px] bg-zinc-100">
          {capa ? (
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={capa}
                alt={tituloAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-zinc-400 sm:h-57.5">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90">
                  <HugeiconsIcon icon={ImageNotFound01Icon} size={24} color="currentColor" strokeWidth={1.9} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-600">Sem foto no momento</p>
                  <p className="mt-1 text-xs text-zinc-400">A imagem do lote será exibida aqui</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-zinc-200/5 pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-zinc-400">
              Informações do veículo
            </span>
          </div>

          <div className="flex items-start gap-2">
            <BemMarcaLogo nome={nomeParaLogo} marca={marcaCodigo} size="sm" />
            <p className="min-w-0 flex-1 text-[15px] font-medium leading-relaxed text-zinc-800">
              {marcaLegivel ? (
                <>
                  <span>{marcaLegivel}</span>
                  {modeloExibir ? <span> {modeloExibir}</span> : null}
                </>
              ) : (
                linhaInfoVeiculo
              )}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-zinc-200/10 pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-zinc-400">
              Sua participação
            </span>
            {row.quantidadeLancesMeuUsuario != null && row.quantidadeLancesMeuUsuario > 1 ? (
              <span className="text-[11px] text-zinc-400">{row.quantidadeLancesMeuUsuario} lances neste item</span>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3 text-zinc-600">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                  <HugeiconsIcon icon={Money03Icon} size={17} color="currentColor" strokeWidth={1.9} />
                </div>
                <span className="truncate text-sm font-medium">Meu lance</span>
              </div>
              <span className="shrink-0 text-right text-sm font-semibold text-zinc-900">{meuValorFmt}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3 text-zinc-600">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                  <HugeiconsIcon icon={AuctionIcon} size={17} color="currentColor" strokeWidth={1.9} />
                </div>
                <span className="truncate text-sm font-medium">Lance atual</span>
              </div>
              <span className="shrink-0 text-right text-sm font-semibold text-zinc-900">{lanceAtualFmt}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3 text-zinc-600">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                  <HugeiconsIcon
                    icon={outcome === "EM_DISPUTA" ? TimeQuarterPassIcon : Clock01Icon}
                    size={17}
                    color="currentColor"
                    strokeWidth={1.9}
                  />
                </div>
                <span className="truncate text-sm font-medium">
                  {outcome === "EM_DISPUTA" ? "Status" : "Resultado"}
                </span>
              </div>
              <span
                className={cn(
                  "shrink-0 text-right text-sm font-semibold",
                  outcome === "GANHADOR"
                    ? "text-emerald-700"
                    : outcome === "NAO_GANHADOR"
                      ? "text-zinc-800"
                      : "text-amber-700",
                )}
              >
                {outcome === "EM_DISPUTA" ? "Em disputa" : outcome === "GANHADOR" ? "Ganhou" : "Não ganhou"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-zinc-600">
              <HugeiconsIcon icon={Calendar03Icon} size={16} color="currentColor" strokeWidth={1.9} />
              <span className="truncate text-sm font-medium">{tipoVeiculoLabel(row.tipoVeiculo)}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function MyBidsPage() {
  const { status: authStatus, isAuthenticated } = useAuth();
  const [rows, setRows] = React.useState<MeuLanceParticipacaoItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, leiloesPublicos] = await Promise.all([
        buscarMeusLances(),
        listarLeiloesPublicos().catch(() => [] as LeilaoResponse[]),
      ]);
      const list = Array.isArray(res?.itens) ? res.itens : [];
      const homeLookup = buildBemLookup(leiloesPublicos);
      const enriched = enrichWithHomeData(list, homeLookup);
      setRows(enriched);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Não foi possível carregar seus lances.";
      setError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (authStatus !== "ready") return;
    if (!isAuthenticated) {
      setLoading(false);
      setRows([]);
      setError(null);
      return;
    }
    void load();
  }, [authStatus, isAuthenticated, load]);

  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<string[]>([]);
  const [selectedVehicle, setSelectedVehicle] = React.useState<string[]>([]);
  const [selectedOutcome, setSelectedOutcome] = React.useState<string[]>([]);

  function toggleFilter(
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  }

  function clearFilters() {
    setSelectedStatus([]);
    setSelectedVehicle([]);
    setSelectedOutcome([]);
  }

  const filteredLances = React.useMemo(() => {
    return rows.filter((row) => {
      const cardStatus = toCardAuctionStatus(row.statusItem);

      if (selectedStatus.length > 0) {
        const okStatus = selectedStatus.some((key) => {
          if (key === "EM_ABERTO") return cardStatus === "ABERTO" || cardStatus === "EM_BREVE";
          if (key === "FECHADO") return cardStatus === "ENCERRADO";
          return false;
        });
        if (!okStatus) return false;
      }

      if (selectedVehicle.length > 0) {
        const vehicleKey = vehicleFilterKey(row.tipoVeiculo);
        const okVehicle = selectedVehicle.some((k) => k === vehicleKey);
        if (!okVehicle) return false;
      }

      if (selectedOutcome.length > 0) {
        const outcome = normalizeOutcome(row.resultadoParticipacao);
        const okOutcome = selectedOutcome.some((key) => {
          if (key === "VENCIDO") return outcome === "GANHADOR";
          if (key === "PERDIDO") return outcome === "NAO_GANHADOR";
          return false;
        });
        if (!okOutcome) return false;
      }

      return true;
    });
  }, [rows, selectedOutcome, selectedStatus, selectedVehicle]);

  const showSkeleton = authStatus !== "ready" || (isAuthenticated && loading);
  const hasRows = rows.length > 0;

  return (
    <>
      <Header />

      <main className="flex-1 py-10 md:py-16">
        <div className="mx-auto w-full max-w-375 px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-4xl">Meus Lances</h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500 sm:mt-3 sm:text-base">
                Acompanhe seus lances e refine a lista por status e tipo de veículo.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFilterOpen(true)}
              disabled={!hasRows || showSkeleton}
              className={cn(
                "h-12 shrink-0 self-start rounded-full border-[1.5px] bg-white px-5 text-sm font-semibold text-[var(--nulance-purple)] transition-all duration-200 sm:h-[56px] sm:px-7 sm:text-[16px]",
                "border-[var(--nulance-purple)]/80 hover:bg-[rgba(99,20,108,0.04)]",
                (!hasRows || showSkeleton) && "pointer-events-none opacity-40"
              )}
            >
              <HugeiconsIcon icon={FilterHorizontalIcon} size={20} color="#63146c" strokeWidth={1.9} />
              <span className="ml-2">Filtros</span>
            </Button>
          </div>

          {authStatus === "ready" && !isAuthenticated ? (
            <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
              <h3 className="text-lg font-semibold text-zinc-900">Entre na sua conta</h3>
              <p className="mt-2 max-w-md text-sm text-zinc-500">
                Faça login para ver o histórico dos seus lances nos leilões.
              </p>
              <Link
                href={`/auth?returnUrl=${encodeURIComponent("/profile/lances")}`}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--nulance-purple)] px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Fazer login
              </Link>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-semibold text-red-800">Não foi possível carregar seus lances</p>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <Button type="button" variant="outline" className="mt-6 rounded-full" onClick={() => void load()}>
                Tentar novamente
              </Button>
            </div>
          ) : showSkeleton ? (
            <MeusLancesGridSkeleton />
          ) : (
            <>
              <div className="mb-6 text-sm font-medium text-zinc-500">
                {filteredLances.length} resultado{filteredLances.length === 1 ? "" : "s"} encontrado
                {filteredLances.length === 1 ? "" : "s"}
              </div>

              {filteredLances.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {filteredLances.map((row) => (
                    <MyBidCard key={row.leilaoLoteBemId} row={row} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-zinc-200/10 bg-zinc-50 py-20 text-center">
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {hasRows ? "Nenhum leilão encontrado" : "Você ainda não tem lances"}
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-zinc-500">
                    {hasRows
                      ? "Ajuste os filtros para ver leilões que atendam aos critérios selecionados."
                      : "Quando você participar de um leilão, ele aparecerá aqui."}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Sheet open={isFilterOpen} onClose={() => setIsFilterOpen(false)} side="right">
        <SheetContent className="flex w-full max-w-[400px] flex-col overflow-hidden bg-white">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle className="text-2xl font-bold text-zinc-900">Filtros</SheetTitle>
            <SheetDescription className="text-base text-zinc-500">
              Refine sua busca para encontrar os melhores leilões com base no seu histórico de lances.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.02em] text-zinc-900">
                  Status do Leilão
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["EM_ABERTO", "FECHADO"].map((key) => {
                    const isActive = selectedStatus.includes(key);
                    const label = key === "EM_ABERTO" ? "Em aberto" : "Fechado";
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleFilter(selectedStatus, setSelectedStatus, key)}
                        className={cn(
                          "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors",
                          isActive
                            ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <SheetSeparator className="bg-zinc-100" />

              <div>
                <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.02em] text-zinc-900">
                  Tipo de veículo
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["MOTO", "CARRO", "CAMINHAO"].map((key) => {
                    const isActive = selectedVehicle.includes(key);
                    const label = key === "MOTO" ? "Moto" : key === "CARRO" ? "Carro" : "Caminhão";
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleFilter(selectedVehicle, setSelectedVehicle, key)}
                        className={cn(
                          "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors",
                          isActive
                            ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <SheetSeparator className="bg-zinc-100" />

              <div>
                <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.02em] text-zinc-900">
                  Resultado do leilão
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["VENCIDO", "PERDIDO"].map((key) => {
                    const isActive = selectedOutcome.includes(key);
                    const label = key === "VENCIDO" ? "Vencido" : "Perdido";
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleFilter(selectedOutcome, setSelectedOutcome, key)}
                        className={cn(
                          "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors",
                          isActive
                            ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white"
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 p-6 pt-4">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearFilters();
                }}
                className="h-12 flex-1 rounded-full border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              >
                Limpar
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setIsFilterOpen(false);
                }}
                className="h-12 flex-[2] rounded-full bg-[var(--nulance-purple)] text-white hover:opacity-90"
              >
                Ver resultados
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Footer />
    </>
  );
}
