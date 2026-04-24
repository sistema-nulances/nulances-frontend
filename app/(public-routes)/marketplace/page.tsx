"use client";

import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { HeroBanner } from "@/components/home/hero-banner";
import { MarketplaceCarCard } from "@/components/marketplace/marketplace-car-card";
import type { MarketplaceCategoryFilter } from "@/data/marketplace-items";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { MarketplaceFiltersTabs, type MarketplaceFilters } from "@/components/marketplace/marketplace-filters-tabs";
import { Pagination } from "@/components/ui/pagination";
import { formatEnumDisplayLabel } from "@/lib/format-enum-label";
import { listarAnunciosPublicos } from "@/lib/repositories/marketplace-anuncios-public-repository";
import { mapAnuncioPublicoListToMarketplaceItem } from "@/lib/marketplace-public-map";
import type { MarketplaceItem } from "@/data/marketplace-items";

const PUBLIC_LIST_PAGE_SIZE = 120;

export default function MarketplaceHomePage() {
  const [selectedCategory, setSelectedCategory] =
    React.useState<MarketplaceCategoryFilter>("todos");
  const [query, setQuery] = React.useState("");
  const [searchDebounced, setSearchDebounced] = React.useState("");
  const [filters, setFilters] = React.useState<MarketplaceFilters | undefined>(undefined);
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = React.useState(1);

  const [apiItems, setApiItems] = React.useState<MarketplaceItem[]>([]);
  const [listLoading, setListLoading] = React.useState(true);
  const [listError, setListError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = window.setTimeout(() => setSearchDebounced(query.trim()), 400);
    return () => window.clearTimeout(t);
  }, [query]);

  React.useEffect(() => {
    let active = true;
    setListLoading(true);
    setListError(null);
    void listarAnunciosPublicos({
      busca: searchDebounced || undefined,
      page: 0,
      size: PUBLIC_LIST_PAGE_SIZE,
    })
      .then((page) => {
        if (!active) return;
        const mapped = (page.content ?? []).flatMap((row) => {
          try {
            return [mapAnuncioPublicoListToMarketplaceItem(row)];
          } catch {
            return [];
          }
        });
        setApiItems(mapped);
      })
      .catch((e: unknown) => {
        if (!active) return;
        setApiItems([]);
        setListError(e instanceof Error ? e.message : "Não foi possível carregar os anúncios.");
      })
      .finally(() => {
        if (active) setListLoading(false);
      });
    return () => {
      active = false;
    };
  }, [searchDebounced]);

  const filteredItems = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return apiItems.filter((item) => {
      if (selectedCategory !== "todos" && item.categoria !== selectedCategory) return false;

      if (filters) {
        if (
          filters.status.length > 0 &&
          !filters.status.some((s) => s === item.status)
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
          !filters.cambio.some((f) => formatEnumDisplayLabel(item.cambio) === formatEnumDisplayLabel(f))
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

        if (filters.local.length > 0) {
          const matchesLocal = filters.local.some((uf) => item.local.includes(uf));
          if (!matchesLocal) return false;
        }
      }

      if (!q) return true;

      const haystack = `${item.titulo} ${item.marca} ${item.modelo} ${item.local}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [apiItems, query, selectedCategory, filters]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCategory, filters, searchDebounced]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const pageItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header />

      <HeroBanner variant="marketplace" />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-[1720px] px-4 py-10 md:px-6">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-zinc-950 md:text-4xl">
                Marketplace
              </h1>
              <p className="mt-2 text-sm text-zinc-500 md:text-base">
                Compre e descubra anúncios por categoria.
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-3">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  id="marketplace-search"
                  placeholder="Buscar por marca, modelo ou local"
                  className="h-14"
                  leftIcon={
                    <HugeiconsIcon
                      icon={Search01Icon}
                      size={20}
                      color="currentColor"
                      strokeWidth={1.9}
                    />
                  }
                />
                <Button
                  type="button"
                  size="md"
                  className="h-14 shrink-0 rounded-full px-7 sm:w-auto"
                  onClick={() => {
                    // busca no servidor (modelo) após debounce; aqui só reforça o foco no campo
                  }}
                >
                  Buscar
                </Button>
              </div>
            </div>
          </div>

          <MarketplaceFiltersTabs
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onFilterApply={(next) => setFilters(next)}
          />

          {listError ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {listError}
            </div>
          ) : null}

          <div className="mb-6 text-sm font-medium text-zinc-500">
            {listLoading ? "Carregando anúncios…" : `${filteredItems.length} anúncios`}
          </div>

          {listLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[420px] animate-pulse rounded-[28px] bg-zinc-100/80 ring-1 ring-zinc-200/40"
                />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {pageItems.map((item) => (
                  <MarketplaceCarCard key={String(item.id)} item={item} />
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
              <p className="text-lg font-semibold text-zinc-900">Nenhum anúncio encontrado</p>
              <p className="mt-2 max-w-md text-sm text-zinc-500">
                Tente ajustar a categoria ou remover o texto da busca.
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
