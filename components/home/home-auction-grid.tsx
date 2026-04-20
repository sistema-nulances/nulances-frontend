"use client";

import React from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { AuctionStatus } from "@/data/auction-items";
import { AuctionCard, type HomeAuctionCardItem } from "./auction-card";
import { Badge } from "@/components/ui/badge";
import { getApiBaseUrl, getApiOrigin } from "@/lib/api/api-url";
import { listarLeiloesPublicos } from "@/lib/repositories/admin-leiloes-repository";
import type { LeilaoResponse } from "@/lib/repositories/types/leilao.types";
import { formatEnumDisplayLabel } from "@/lib/format-enum-label";
import { tituloCompletoBemLeilao, veiculoLinhaInformacoes } from "@/lib/leilao-bem-exibicao";
import { cn } from "@/lib/cn";

export type AuctionFilters = {
  tipoVeiculo: string[];
  status: string[];
  combustivel: string[];
  cambio: string[];
  condicao: string[];
  local: string[];
};

type HomeItem = HomeAuctionCardItem & {
  leilaoLoteBemId: string;
  aberturaDisputaIso?: string;
};

const HOME_AUCTIONS_CACHE_KEY = "nulance-home-auctions-v1";
const HOME_AUCTIONS_CACHE_TTL_MS = 60_000;

function toAuctionStatus(raw?: string): AuctionStatus {
  const s = String(raw ?? "").toUpperCase();
  if (s === "ABERTO") return "ABERTO";
  if (s === "AGUARDANDO_ABERTURA" || s === "EM_BREVE") return "EM_BREVE";
  return "ENCERRADO";
}

function formatMoney(value?: number | null): string | undefined {
  if (value == null) return undefined;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateLabel(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const hh = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const day = d.toLocaleDateString("pt-BR");
  return `${day} às ${hh}`;
}

function dateKeyFromIso(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateSectionLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map((part) => Number(part));
  const date = new Date(y, (m || 1) - 1, d || 1);
  const label = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function plusDaysDateKey(baseDateKey: string, days: number): string {
  const [y, m, d] = baseDateKey.split("-").map((part) => Number(part));
  const date = new Date(y, (m || 1) - 1, d || 1);
  date.setDate(date.getDate() + days);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, "0");
  const nd = String(date.getDate()).padStart(2, "0");
  return `${ny}-${nm}-${nd}`;
}

type DayFilterKey = "ALL" | "TODAY" | "TOMORROW" | "UPCOMING";

function resolveMediaUrl(raw?: string | null): string | undefined {
  const value = String(raw ?? "").trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }
  const base = getApiBaseUrl();
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${base}${normalizedPath}`;
}

function mapLeiloesToHomeItems(rows: LeilaoResponse[]): HomeItem[] {
  const result: HomeItem[] = [];
  for (const leilao of rows) {
    for (const lote of leilao.lotes ?? []) {
      for (const bem of lote.bens ?? []) {
        const midias = [...(bem.midias ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
        const imageRaw =
          midias.find((m) => String(m.tipo).toUpperCase().includes("IMAGEM"))?.arquivo ?? midias[0]?.arquivo;
        const imageUrl = resolveMediaUrl(imageRaw);
        const modeloStr = String(bem.modelo ?? "").trim();
        result.push({
          id: String(bem.leilaoLoteBemId),
          leilaoLoteBemId: String(bem.leilaoLoteBemId),
          lote: `Lote ${lote.codigoLote}`,
          status: toAuctionStatus(bem.status),
          categoria: String(bem.tipoVeiculo ?? "Bem"),
          titulo: tituloCompletoBemLeilao({
            marcaVeiculo: bem.marcaVeiculo,
            modelo: bem.modelo,
          }),
          marcaVeiculo: bem.marcaVeiculo ?? null,
          modelo: modeloStr || "-",
          local: String(leilao.cidade ?? "Online"),
          veiculo: veiculoLinhaInformacoes({ marcaVeiculo: bem.marcaVeiculo, modelo: bem.modelo }),
          ano: bem.ano != null ? String(bem.ano) : "-",
          km: bem.quilometragem != null ? `${bem.quilometragem.toLocaleString("pt-BR")} km` : "-",
          cambio: String(bem.cambio ?? "-"),
          combustivel: String(bem.combustivel ?? "-"),
          condicao: String(bem.condicao ?? "-"),
          aberturaDisputaIso: bem.aberturaDisputa,
          dataAbertura: formatDateLabel(bem.aberturaDisputa),
          dataEncerramento: formatDateLabel(bem.encerramentoDisputa),
          lanceAtual: formatMoney(bem.lanceAtual ?? bem.valorInicial),
          imageUrl,
        });
      }
    }
  }
  return result;
}

function loadHomeAuctionsFromCache(): HomeItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HOME_AUCTIONS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: number; items?: HomeItem[] };
    if (!Array.isArray(parsed.items) || parsed.items.length === 0) return null;
    if (typeof parsed.savedAt !== "number") return null;
    if (Date.now() - parsed.savedAt > HOME_AUCTIONS_CACHE_TTL_MS) return null;
    return parsed.items;
  } catch {
    return null;
  }
}

function saveHomeAuctionsToCache(items: HomeItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HOME_AUCTIONS_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), items }));
  } catch {
    // ignore storage quota issues
  }
}

export function HomeAuctionGrid({ filters }: { filters?: AuctionFilters }) {
  const [items, setItems] = React.useState<HomeItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dayFilter, setDayFilter] = React.useState<DayFilterKey>("ALL");

  React.useEffect(() => {
    let active = true;
    const cached = loadHomeAuctionsFromCache();
    if (cached && cached.length > 0) {
      setItems(cached);
      setLoading(false);
    }

    const load = async () => {
      if (!cached || cached.length === 0) {
        setLoading(true);
      }
      try {
        const rows = await listarLeiloesPublicos();
        if (!active) return;
        const mapped = mapLeiloesToHomeItems(rows);
        setItems(mapped);
        saveHomeAuctionsToCache(mapped);
      } catch {
        if (!active) return;
        if (!cached) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    if (items.length === 0) return;
    const wsBase = process.env.NEXT_PUBLIC_WS_URL?.trim() || `${getApiOrigin()}/ws`;
    const client = new Client({
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS(wsBase),
    });
    client.onConnect = () => {
      for (const item of items) {
        client.subscribe(`/topic/leiloes/itens/${item.leilaoLoteBemId}`, (frame) => {
          try {
            const payload = JSON.parse(frame.body) as {
              itemId?: string;
              valorAtual?: number | null;
            };
            const itemId = String(payload.itemId ?? "");
            if (!itemId) return;
            setItems((prev) =>
              prev.map((x) =>
                x.leilaoLoteBemId === itemId
                  ? { ...x, lanceAtual: formatMoney(payload.valorAtual) ?? x.lanceAtual }
                  : x
              )
            );
          } catch {
            // ignore
          }
        });
      }
    };
    client.activate();
    return () => {
      client.deactivate();
    };
  }, [items.map((i) => i.leilaoLoteBemId).join(",")]);

  const filteredItems = React.useMemo(() => {
    if (!filters) return items;

    return items.filter((item) => {
      if (
        filters.tipoVeiculo.length > 0 &&
        !filters.tipoVeiculo.some((tipo) => String(tipo).toUpperCase() === String(item.categoria).toUpperCase())
      ) {
        return false;
      }

      // Status filter
      if (
        filters.status.length > 0 &&
        !filters.status.some(
          (s) => s.toUpperCase().replace(" ", "_") === item.status
        )
      ) {
        return false;
      }

      if (
        filters.combustivel.length > 0 &&
        !filters.combustivel.some(
          (f) => formatEnumDisplayLabel(item.combustivel) === formatEnumDisplayLabel(f)
        )
      ) {
        return false;
      }

      if (
        filters.cambio.length > 0 &&
        !filters.cambio.some(
          (f) => formatEnumDisplayLabel(item.cambio) === formatEnumDisplayLabel(f)
        )
      ) {
        return false;
      }

      if (
        filters.condicao.length > 0 &&
        !filters.condicao.some(
          (f) => formatEnumDisplayLabel(item.condicao) === formatEnumDisplayLabel(f)
        )
      ) {
        return false;
      }

      // Local filter (checks if the city/state string ends with or contains the selected state)
      if (filters.local.length > 0) {
        const matchesLocal = filters.local.some((state) =>
          item.local.includes(state)
        );
        if (!matchesLocal) return false;
      }

      return true;
    });
  }, [filters, items]);

  const todayKey = React.useMemo(() => getTodayDateKey(), []);
  const tomorrowKey = React.useMemo(() => plusDaysDateKey(todayKey, 1), [todayKey]);

  React.useEffect(() => {
    setDayFilter("ALL");
  }, [filters]);

  const dayFilterCounts = React.useMemo(
    () => ({
      ALL: filteredItems.length,
      TODAY: filteredItems.filter((item) => dateKeyFromIso(item.aberturaDisputaIso) === todayKey).length,
      TOMORROW: filteredItems.filter((item) => dateKeyFromIso(item.aberturaDisputaIso) === tomorrowKey).length,
      UPCOMING: filteredItems.filter((item) => {
        const key = dateKeyFromIso(item.aberturaDisputaIso);
        return Boolean(key && key > tomorrowKey);
      }).length,
    }),
    [filteredItems, todayKey, tomorrowKey]
  );

  const dayFilteredItems = React.useMemo(() => {
    return filteredItems.filter((item) => {
      const key = dateKeyFromIso(item.aberturaDisputaIso);
      if (!key) return dayFilter === "ALL";
      if (dayFilter === "TODAY") return key === todayKey;
      if (dayFilter === "TOMORROW") return key === tomorrowKey;
      if (dayFilter === "UPCOMING") return key > tomorrowKey;
      return true;
    });
  }, [dayFilter, filteredItems, todayKey, tomorrowKey]);

  const groupedByDay = React.useMemo(() => {
    const groups = new Map<string, HomeItem[]>();
    for (const item of dayFilteredItems) {
      const key = dateKeyFromIso(item.aberturaDisputaIso) ?? "sem-data";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }

    const entries = Array.from(groups.entries()).sort((a, b) => {
      if (a[0] === "sem-data") return 1;
      if (b[0] === "sem-data") return -1;
      return a[0].localeCompare(b[0]);
    });

    return entries.map(([key, itemsForDay]) => {
      if (key === todayKey) return { key, title: "Leilões de Hoje", items: itemsForDay };
      if (key === tomorrowKey) return { key, title: "Leilões de Amanhã", items: itemsForDay };
      if (key === "sem-data") return { key, title: "Sem data definida", items: itemsForDay };
      return { key, title: formatDateSectionLabel(key), items: itemsForDay };
    });
  }, [dayFilteredItems, todayKey, tomorrowKey]);

  return (
    <section className="w-full bg-white py-10 md:py-12">
      <div className="mx-auto w-full max-w-430 px-4 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <Badge variant="purple" className="mb-3">
              Leilões em destaque
            </Badge>

            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-zinc-900 md:text-4xl">
              Oportunidades prontas para receber lance
            </h2>

            <p className="mt-2 text-sm text-zinc-500 md:text-base">
              Cards com lote, veículo, abertura do leilão, encerramento e lance inicial.
            </p>
          </div>
        </div>
        
        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { key: "ALL", label: "Todos" },
            { key: "TODAY", label: "Hoje" },
            { key: "TOMORROW", label: "Amanhã" },
            { key: "UPCOMING", label: "Próximos dias" },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setDayFilter(option.key as DayFilterKey)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                dayFilter === option.key
                  ? "border-nulance-purple bg-nulance-purple text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-nulance-purple/40 hover:text-nulance-purple"
              )}
            >
              <span>{option.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  dayFilter === option.key ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-600"
                )}
              >
                {dayFilterCounts[option.key as DayFilterKey]}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-6 text-sm font-medium text-zinc-500">
          {dayFilteredItems.length} resultados encontrados
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-zinc-200/20 bg-zinc-50 py-16 text-center text-zinc-500">
            Carregando leilões...
          </div>
        ) : groupedByDay.length > 0 ? (
          <div className="space-y-10">
            {groupedByDay.map((group) => (
              <section key={group.key} className="space-y-5">
                <div className="flex items-center justify-between gap-3 border-b border-zinc-200/70 pb-3">
                  <h3 className="text-lg font-semibold text-zinc-900 md:text-xl">{group.title}</h3>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
                    {group.items.length} itens
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => (
                    <AuctionCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-zinc-200/10 bg-zinc-50 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
              <HugeiconsIcon
                icon={Search01Icon}
                size={28}
                color="currentColor"
                strokeWidth={1.9}
              />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">
              Nenhum leilão encontrado
            </h3>
            <p className="mt-2 text-sm text-zinc-500 max-w-md">
              Não encontramos nenhum leilão com os filtros selecionados.
              Tente limpar os filtros ou buscar por outras características.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
