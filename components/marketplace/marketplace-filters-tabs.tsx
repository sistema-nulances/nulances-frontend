"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetSeparator,
} from "@/components/ui/sheet";
import { MobileFilterScreen } from "@/components/layout/mobile-filter-screen";
import { useIsMobileMaxMd } from "@/lib/use-is-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import { Car03Icon, Motorbike01FreeIcons, TruckIcon, Menu01Icon } from "@hugeicons/core-free-icons";
import type { MarketplaceCategoryFilter, MarketplaceCondicao, MarketplaceStatus } from "@/data/marketplace-items";
import { Badge } from "@/components/ui/badge";

export type MarketplaceFilters = {
  status: MarketplaceStatus[];
  combustivel: string[];
  cambio: string[];
  condicao: MarketplaceCondicao[];
  local: string[];
};

function PlainFilterSep({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-zinc-100", className)} />;
}

type CategoryOpt = {
  value: MarketplaceCategoryFilter;
  label: string;
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
};

function MarketplaceFilterForm({
  categoryOptions,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  setSelectedStatus,
  selectedCombustivel,
  setSelectedCombustivel,
  selectedCambio,
  setSelectedCambio,
  selectedCondicao,
  setSelectedCondicao,
  selectedLocal,
  setSelectedLocal,
  toggleFilter,
  Separator,
}: {
  categoryOptions: CategoryOpt[];
  selectedCategory: MarketplaceCategoryFilter;
  onCategoryChange: (c: MarketplaceCategoryFilter) => void;
  selectedStatus: MarketplaceStatus[];
  setSelectedStatus: React.Dispatch<React.SetStateAction<MarketplaceStatus[]>>;
  selectedCombustivel: string[];
  setSelectedCombustivel: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCambio: string[];
  setSelectedCambio: React.Dispatch<React.SetStateAction<string[]>>;
  selectedCondicao: MarketplaceCondicao[];
  setSelectedCondicao: React.Dispatch<React.SetStateAction<MarketplaceCondicao[]>>;
  selectedLocal: string[];
  setSelectedLocal: React.Dispatch<React.SetStateAction<string[]>>;
  toggleFilter: <T,>(list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, value: T) => void;
  Separator: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.02em] text-zinc-900">Categoria</h3>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((cat) => {
            const active = cat.value === selectedCategory;
            return (
              <Badge
                as="button"
                key={cat.value}
                type="button"
                size="chip"
                variant={active ? "purple" : "neutral"}
                onClick={() => onCategoryChange(cat.value)}
                className={cn(
                  "h-10 gap-2 transition-colors",
                  active
                    ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white hover:opacity-95"
                    : ""
                )}
              >
                <HugeiconsIcon icon={cat.icon} size={18} color="currentColor" strokeWidth={1.9} />
                {cat.label}
              </Badge>
            );
          })}
        </div>
      </div>

      <Separator className="bg-zinc-100" />

      <div>
        <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.02em] text-zinc-900">Status do Anúncio</h3>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { label: "ABERTO" as const, text: "Aberto" },
              { label: "EM_BREVE" as const, text: "Em Breve" },
              { label: "ENCERRADO" as const, text: "Encerrado" },
            ] as const
          ).map((opt) => {
            const isActive = selectedStatus.includes(opt.label);
            return (
              <Badge
                as="button"
                key={opt.label}
                type="button"
                onClick={() => toggleFilter(selectedStatus, setSelectedStatus, opt.label)}
                size="chip"
                variant={isActive ? "purple" : "neutral"}
                className={cn(
                  "h-10",
                  isActive
                    ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white hover:opacity-95"
                    : ""
                )}
              >
                {opt.text}
              </Badge>
            );
          })}
        </div>
      </div>

      <Separator className="bg-zinc-100" />

      <div>
        <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.02em] text-zinc-900">Combustível</h3>
        <div className="flex flex-wrap gap-2">
          {["Flex", "Diesel", "Gasolina", "Etanol", "Elétrico", "Híbrido"].map((item) => {
            const isActive = selectedCombustivel.includes(item);
            return (
              <Badge
                as="button"
                key={item}
                type="button"
                onClick={() => toggleFilter(selectedCombustivel, setSelectedCombustivel, item)}
                size="chip"
                variant={isActive ? "purple" : "neutral"}
                className={cn(
                  "h-10",
                  isActive
                    ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white hover:opacity-95"
                    : ""
                )}
              >
                {item}
              </Badge>
            );
          })}
        </div>
      </div>

      <Separator className="bg-zinc-100" />

      <div>
        <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.02em] text-zinc-900">Câmbio</h3>
        <div className="flex flex-wrap gap-2">
          {["Automático", "Manual", "CVT", "Automatizado"].map((item) => {
            const isActive = selectedCambio.includes(item);
            return (
              <Badge
                as="button"
                key={item}
                type="button"
                onClick={() => toggleFilter(selectedCambio, setSelectedCambio, item)}
                size="chip"
                variant={isActive ? "purple" : "neutral"}
                className={cn(
                  "h-10",
                  isActive
                    ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white hover:opacity-95"
                    : ""
                )}
              >
                {item}
              </Badge>
            );
          })}
        </div>
      </div>

      <Separator className="bg-zinc-100" />

      <div>
        <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.02em] text-zinc-900">Condição</h3>
        <div className="flex flex-wrap gap-2">
          {["Conservado", "Recuperável", "Sucata", "Trabalho Pesado", "Ótimo Estado"].map((item) => {
            const cond = item as MarketplaceCondicao;
            const isActive = selectedCondicao.includes(cond);
            return (
              <Badge
                as="button"
                key={item}
                type="button"
                onClick={() => toggleFilter(selectedCondicao, setSelectedCondicao, cond)}
                size="chip"
                variant={isActive ? "purple" : "neutral"}
                className={cn(
                  "h-10",
                  isActive
                    ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white hover:opacity-95"
                    : ""
                )}
              >
                {item}
              </Badge>
            );
          })}
        </div>
      </div>

      <Separator className="bg-zinc-100" />

      <div>
        <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.02em] text-zinc-900">Local</h3>
        <div className="flex flex-wrap gap-2">
          {["SP", "RJ", "MG", "MT", "GO", "MS", "PR", "SC", "RS"].map((item) => {
            const isActive = selectedLocal.includes(item);
            return (
              <Badge
                as="button"
                key={item}
                type="button"
                onClick={() => toggleFilter(selectedLocal, setSelectedLocal, item)}
                size="chip"
                variant={isActive ? "purple" : "neutral"}
                className={cn(
                  "h-10",
                  isActive
                    ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white hover:opacity-95"
                    : ""
                )}
              >
                {item}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MarketplaceFiltersTabs({
  selectedCategory,
  onCategoryChange,
  onFilterApply,
}: {
  selectedCategory: MarketplaceCategoryFilter;
  onCategoryChange: (c: MarketplaceCategoryFilter) => void;
  onFilterApply: (filters: MarketplaceFilters) => void;
}) {
  const isMobile = useIsMobileMaxMd();
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const [selectedStatus, setSelectedStatus] = React.useState<MarketplaceStatus[]>([]);
  const [selectedCombustivel, setSelectedCombustivel] = React.useState<string[]>([]);
  const [selectedCambio, setSelectedCambio] = React.useState<string[]>([]);
  const [selectedCondicao, setSelectedCondicao] = React.useState<MarketplaceCondicao[]>([]);
  const [selectedLocal, setSelectedLocal] = React.useState<string[]>([]);

  function toggleFilter<T>(list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, value: T) {
    if (list.includes(value)) setList(list.filter((v) => v !== value));
    else setList([...list, value]);
  }

  function clearFilters() {
    setSelectedStatus([]);
    setSelectedCombustivel([]);
    setSelectedCambio([]);
    setSelectedCondicao([]);
    setSelectedLocal([]);
  }

  function handleApply() {
    setIsFilterOpen(false);
    onFilterApply({
      status: selectedStatus,
      combustivel: selectedCombustivel,
      cambio: selectedCambio,
      condicao: selectedCondicao,
      local: selectedLocal,
    });
  }

  const categoryOptions: CategoryOpt[] = [
    { value: "todos", label: "Todos", icon: Menu01Icon },
    { value: "carros", label: "Carros", icon: Car03Icon },
    { value: "motos", label: "Motos", icon: Motorbike01FreeIcons },
    { value: "caminhoes", label: "Caminhões", icon: TruckIcon },
  ];

  const formProps = {
    categoryOptions,
    selectedCategory,
    onCategoryChange,
    selectedStatus,
    setSelectedStatus,
    selectedCombustivel,
    setSelectedCombustivel,
    selectedCambio,
    setSelectedCambio,
    selectedCondicao,
    setSelectedCondicao,
    selectedLocal,
    setSelectedLocal,
    toggleFilter,
  };

  const footer = (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={clearFilters}
        className="h-12 flex-1 rounded-full border-zinc-200 text-zinc-600 hover:bg-zinc-50"
      >
        Limpar
      </Button>
      <Button
        type="button"
        onClick={handleApply}
        className="h-12 flex-[2] rounded-full bg-[var(--nulance-purple)] text-white hover:opacity-90"
      >
        Ver resultados
      </Button>
    </div>
  );

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsFilterOpen(true)}
          className={cn(
            "h-11 w-full rounded-full border-[1.5px] px-5 sm:h-[42px] sm:w-auto",
            "border-zinc-200 bg-white/40 text-[var(--nulance-purple)]",
            "hover:border-zinc-300 hover:bg-white/60"
          )}
        >
          <HugeiconsIcon icon={FilterHorizontalIcon} size={20} color="#63146c" strokeWidth={1.9} />
          <span className="ml-2">Filtros</span>
        </Button>
      </div>

      <MobileFilterScreen
        open={isFilterOpen && isMobile}
        onClose={() => setIsFilterOpen(false)}
        title="Filtros"
        description="Refine sua busca para encontrar os melhores veículos."
        footer={footer}
      >
        <MarketplaceFilterForm {...formProps} Separator={PlainFilterSep} />
      </MobileFilterScreen>

      <Sheet open={isFilterOpen && !isMobile} onClose={() => setIsFilterOpen(false)} side="right">
        <SheetContent className="flex w-full max-w-[400px] flex-col overflow-hidden bg-white">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle className="text-2xl font-bold text-zinc-900">Filtros</SheetTitle>
            <SheetDescription className="text-base text-zinc-500">
              Refine sua busca para encontrar os melhores veículos.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <MarketplaceFilterForm {...formProps} Separator={SheetSeparator} />
          </div>

          <div className="border-t border-zinc-100 p-6 pt-4">{footer}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
