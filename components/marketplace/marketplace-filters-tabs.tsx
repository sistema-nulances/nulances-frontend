"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Select, type SelectOption } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { MarketplaceCategoryFilter } from "@/data/marketplace-items";

export type MarketplaceFilters = {
  tipo?: string;
  condicao?: string;
  combustivel?: string;
  cambio?: string;
  local: string[];
};

type CategoryOpt = {
  value: MarketplaceCategoryFilter;
  label: string;
  emoji: string;
};

const CATEGORY_OPTIONS: CategoryOpt[] = [
  { value: "todos", label: "Todos", emoji: "📂" },
  { value: "VEICULOS", label: "Automóveis", emoji: "🚗" },
  { value: "IMOVEIS", label: "Imóveis", emoji: "🏠" },
  { value: "CELULARES_E_TELEFONIA", label: "Celulares e telefonia", emoji: "📱" },
  { value: "CASA_DECORACAO_E_UTENSILIOS", label: "Casa, decoração e utensílios", emoji: "🏡" },
  { value: "ESPORTES_E_FITNESS", label: "Esportes e fitness", emoji: "🏋️" },
  { value: "SERVICOS", label: "Serviços", emoji: "🛠️" },
  { value: "MODA_E_BELEZA", label: "Moda e beleza", emoji: "💄" },
  { value: "ARTIGOS_INFANTIS", label: "Artigos infantis", emoji: "🧸" },
  { value: "ANIMAIS_DE_ESTIMACAO", label: "Animais de estimação", emoji: "🐾" },
  { value: "MUSICA_E_HOBBIES", label: "Música e hobbies", emoji: "🎵" },
  { value: "AGRO_E_INDUSTRIA", label: "Agro e indústria", emoji: "🌾" },
  { value: "VAGAS_DE_EMPREGO", label: "Vagas de emprego", emoji: "💼" },
  { value: "COMERCIO", label: "Comércio", emoji: "🏪" },
  { value: "GAMES", label: "Games", emoji: "🎮" },
  { value: "TVS_E_VIDEO", label: "TVs e vídeo", emoji: "📺" },
  { value: "AUDIO", label: "Áudio", emoji: "🎧" },
  { value: "INFORMATICA", label: "Informática", emoji: "💻" },
  { value: "ELETRO", label: "Eletro", emoji: "🔌" },
  { value: "MOVEIS", label: "Móveis", emoji: "🪑" },
  { value: "MATERIAIS_DE_CONSTRUCAO", label: "Materiais de construção", emoji: "🧱" },
  { value: "ESCRITORIO_E_HOME_OFFICE", label: "Escritório e home office", emoji: "🖇️" },
];

const TIPO_VEICULO_OPTIONS: SelectOption[] = [
  { value: "", label: "Todos os tipos" },
  { value: "CARRO", label: "Carro" },
  { value: "MOTO", label: "Moto" },
  { value: "CAMINHAO", label: "Caminhão" },
  { value: "SUV", label: "SUV" },
  { value: "CAMINHONETE", label: "Caminhonete" },
  { value: "ONIBUS", label: "Ônibus" },
];

const CONDICAO_VEICULO_OPTIONS: SelectOption[] = [
  { value: "", label: "Todas as condições" },
  { value: "PEQUENA_MONTA", label: "Pequena monta" },
  { value: "MEDIA_MONTA", label: "Média monta" },
  { value: "GRANDE_MONTA", label: "Grande monta" },
];

const COMBUSTIVEL_VEICULO_OPTIONS: SelectOption[] = [
  { value: "", label: "Todos os combustíveis" },
  { value: "FLEX", label: "Flex" },
  { value: "DIESEL", label: "Diesel" },
  { value: "GASOLINA", label: "Gasolina" },
  { value: "ETANOL", label: "Etanol" },
  { value: "ELETRICO", label: "Elétrico" },
  { value: "HIBRIDO", label: "Híbrido" },
];

const CAMBIO_VEICULO_OPTIONS: SelectOption[] = [
  { value: "", label: "Todos os câmbios" },
  { value: "AUTOMATICO", label: "Automático" },
  { value: "MANUAL", label: "Manual" },
  { value: "CVT", label: "CVT" },
  { value: "AUTOMATIZADO", label: "Automatizado" },
];

export function MarketplaceFiltersTabs({
  selectedCategory,
  onCategoryChange,
  filters,
  onFiltersChange,
}: {
  selectedCategory: MarketplaceCategoryFilter;
  onCategoryChange: (c: MarketplaceCategoryFilter) => void;
  filters: MarketplaceFilters;
  onFiltersChange: (next: MarketplaceFilters) => void;
}) {
  const mostrarSubfiltrosVeiculo = selectedCategory === "VEICULOS";

  const updateSubFilter = React.useCallback(
    (patch: Partial<MarketplaceFilters>) => {
      onFiltersChange({ ...filters, ...patch });
    },
    [filters, onFiltersChange]
  );

  const handleCategoryChange = React.useCallback(
    (next: MarketplaceCategoryFilter) => {
      onCategoryChange(next);
      if (next !== "VEICULOS") {
        onFiltersChange({
          ...filters,
          tipo: undefined,
          condicao: undefined,
          combustivel: undefined,
          cambio: undefined,
        });
      }
    },
    [filters, onCategoryChange, onFiltersChange]
  );

  return (
    <div className="mb-6 space-y-5">
      <div>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-zinc-500">
          Categorias
        </h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((cat) => {
            const active = cat.value === selectedCategory;
            return (
              <Badge
                as="button"
                key={cat.value}
                type="button"
                size="chip"
                variant={active ? "purple" : "neutral"}
                onClick={() => handleCategoryChange(cat.value)}
                className={cn(
                  "h-10 gap-2 transition-colors",
                  active
                    ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white hover:opacity-95"
                    : ""
                )}
              >
                <span aria-hidden className="text-base leading-none">
                  {cat.emoji}
                </span>
                {cat.label}
              </Badge>
            );
          })}
        </div>
      </div>

      {mostrarSubfiltrosVeiculo ? (
        <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 sm:p-5">
          <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-zinc-500">
            Refinar busca por automóveis
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              value={filters.tipo ?? ""}
              onValueChange={(v) => updateSubFilter({ tipo: v || undefined })}
              options={TIPO_VEICULO_OPTIONS}
              placeholder="Tipo de veículo"
            />
            <Select
              value={filters.condicao ?? ""}
              onValueChange={(v) => updateSubFilter({ condicao: v || undefined })}
              options={CONDICAO_VEICULO_OPTIONS}
              placeholder="Condição"
            />
            <Select
              value={filters.combustivel ?? ""}
              onValueChange={(v) => updateSubFilter({ combustivel: v || undefined })}
              options={COMBUSTIVEL_VEICULO_OPTIONS}
              placeholder="Combustível"
            />
            <Select
              value={filters.cambio ?? ""}
              onValueChange={(v) => updateSubFilter({ cambio: v || undefined })}
              options={CAMBIO_VEICULO_OPTIONS}
              placeholder="Câmbio"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
