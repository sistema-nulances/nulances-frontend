"use client";

import { useCallback, useMemo } from "react";
import { parseAsString, useQueryStates } from "nuqs";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { HeroBanner } from "@/components/home/hero-banner";
import { HomeCategoriesTabs } from "@/components/home/home-categories-tabs";
import { HomeAuctionGrid, AuctionFilters } from "@/components/home/home-auction-grid";

const DEFAULT_FILTERS: AuctionFilters = {
  tipoVeiculo: [],
  status: [],
  combustivel: [],
  cambio: [],
  condicao: [],
  local: [],
};

function uniqueUpper(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => String(v).trim()).filter(Boolean)));
}

function parseCsv(value: string, fallback: string[] = []): string[] {
  const parsed = uniqueUpper(
    value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
  );
  return parsed.length > 0 ? parsed : fallback;
}

export default function Home() {
  const [queryFilters, setQueryFilters] = useQueryStates(
    {
      tipoVeiculo: parseAsString.withDefault(""),
      status: parseAsString.withDefault(""),
      combustivel: parseAsString.withDefault(""),
      cambio: parseAsString.withDefault(""),
      condicao: parseAsString.withDefault(""),
      local: parseAsString.withDefault(""),
    },
    {
      history: "replace",
      clearOnDefault: true,
      shallow: false,
    }
  );
  const filters = useMemo<AuctionFilters>(
    () => ({
      tipoVeiculo: parseCsv(queryFilters.tipoVeiculo, DEFAULT_FILTERS.tipoVeiculo),
      status: parseCsv(queryFilters.status),
      combustivel: parseCsv(queryFilters.combustivel),
      cambio: parseCsv(queryFilters.cambio),
      condicao: parseCsv(queryFilters.condicao),
      local: parseCsv(queryFilters.local),
    }),
    [queryFilters]
  );

  const handleFilterChange = useCallback(
    (next: AuctionFilters) => {
      void setQueryFilters({
        tipoVeiculo:
          next.tipoVeiculo.length > 0 ? uniqueUpper(next.tipoVeiculo).join(",") : "",
        status: uniqueUpper(next.status).join(","),
        combustivel: uniqueUpper(next.combustivel).join(","),
        cambio: uniqueUpper(next.cambio).join(","),
        condicao: uniqueUpper(next.condicao).join(","),
        local: uniqueUpper(next.local).join(","),
      });
    },
    [setQueryFilters]
  );

  return (
    <main className="min-h-screen bg-[var(--background)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header />
      <HeroBanner />
      <HomeCategoriesTabs filters={filters} onFilterChange={handleFilterChange} />
      <HomeAuctionGrid filters={filters} />
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
