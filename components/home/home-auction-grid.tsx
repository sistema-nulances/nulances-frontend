"use client";

import React from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { AuctionStatus } from "@/data/auction-items";
import { AuctionCard, type HomeAuctionCardItem } from "./auction-card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { getApiBaseUrl, getApiOrigin } from "@/lib/api/api-url";
import { listarLeiloesPublicos } from "@/lib/repositories/admin-leiloes-repository";
import type { LeilaoResponse } from "@/lib/repositories/types/leilao.types";
import { formatEnumDisplayLabel } from "@/lib/format-enum-label";
import { tituloCompletoBemLeilao, veiculoLinhaInformacoes } from "@/lib/leilao-bem-exibicao";

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

  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const pageItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
        
        <div className="text-sm font-medium text-zinc-500 mb-6">
          {filteredItems.length} resultados encontrados
        </div>
        
        {loading ? (
          <div className="rounded-[28px] border border-zinc-200/20 bg-zinc-50 py-16 text-center text-zinc-500">
            Carregando leilões...
          </div>
        ) : filteredItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((item) => (
              <AuctionCard key={item.id} item={item} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
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
