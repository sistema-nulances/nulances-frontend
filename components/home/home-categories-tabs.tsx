"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  FilterHorizontalIcon,
  Car03Icon,
  Motorbike01FreeIcons,
  TruckIcon,
  Bus01Icon,
} from "@hugeicons/core-free-icons";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/cn";
import { AuctionFilters } from "./home-auction-grid";

function PlainFilterSep({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-zinc-100", className)} />;
}

function HomeAuctionFilterForm({
  selectedStatus,
  selectedCombustivel,
  selectedCambio,
  selectedCondicao,
  selectedLocal,
  toggleFilter,
  setSelectedStatus,
  setSelectedCombustivel,
  setSelectedCambio,
  setSelectedCondicao,
  setSelectedLocal,
  Separator,
}: {
  selectedStatus: string[];
  selectedCombustivel: string[];
  selectedCambio: string[];
  selectedCondicao: string[];
  selectedLocal: string[];
  toggleFilter: (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => void;
  setSelectedStatus: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedCombustivel: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedCambio: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedCondicao: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedLocal: React.Dispatch<React.SetStateAction<string[]>>;
  Separator: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.02em] text-zinc-900">
          Status do Leilão
        </h3>
        <div className="flex flex-wrap gap-2">
          {["Aberto", "Em Breve", "Encerrado"].map((status) => {
            const isActive = selectedStatus.includes(status);
            return (
              <button
                key={status}
                type="button"
                onClick={() => toggleFilter(selectedStatus, setSelectedStatus, status)}
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                )}
              >
                {status}
              </button>
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
              <button
                key={item}
                type="button"
                onClick={() => toggleFilter(selectedCombustivel, setSelectedCombustivel, item)}
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                )}
              >
                {item}
              </button>
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
              <button
                key={item}
                type="button"
                onClick={() => toggleFilter(selectedCambio, setSelectedCambio, item)}
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="bg-zinc-100" />

      <div>
        <h3 className="mb-4 text-[15px] font-semibold tracking-[-0.02em] text-zinc-900">Condição</h3>
        <div className="flex flex-wrap gap-2">
          {["Conservado", "Recuperável", "Sucata", "Trabalho Pesado", "Ótimo Estado"].map((item) => {
            const isActive = selectedCondicao.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleFilter(selectedCondicao, setSelectedCondicao, item)}
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                )}
              >
                {item}
              </button>
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
              <button
                key={item}
                type="button"
                onClick={() => toggleFilter(selectedLocal, setSelectedLocal, item)}
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors",
                  isActive
                    ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const categories = [
  { value: "TODOS", label: "Todos", icon: FilterHorizontalIcon },
  { value: "CARRO", label: "Carros", icon: Car03Icon },
  { value: "MOTO", label: "Motos", icon: Motorbike01FreeIcons },
  { value: "CAMINHAO", label: "Caminhões", icon: TruckIcon },
  { value: "SUV", label: "SUV", icon: Car03Icon },
  { value: "CAMINHONETE", label: "Caminhonetes", icon: TruckIcon },
  { value: "ONIBUS", label: "Ônibus", icon: Bus01Icon },
];

export function HomeCategoriesTabs({
  filters,
  onFilterChange,
}: {
  filters?: AuctionFilters;
  onFilterChange?: (filters: AuctionFilters) => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const isMobile = useIsMobileMaxMd();

  // States for filters
  const normalizedTipo = React.useMemo(() => {
    const raw = String(filters?.tipoVeiculo?.[0] ?? categories[0].value).toUpperCase();
    return categories.some((c) => c.value === raw) ? raw : categories[0].value;
  }, [filters?.tipoVeiculo]);

  const [selectedStatus, setSelectedStatus] = React.useState<string[]>(filters?.status ?? []);
  const [selectedCombustivel, setSelectedCombustivel] = React.useState<string[]>(filters?.combustivel ?? []);
  const [selectedCambio, setSelectedCambio] = React.useState<string[]>(filters?.cambio ?? []);
  const [selectedCondicao, setSelectedCondicao] = React.useState<string[]>(filters?.condicao ?? []);
  const [selectedLocal, setSelectedLocal] = React.useState<string[]>(filters?.local ?? []);
  const [selectedTipoVeiculo, setSelectedTipoVeiculo] = React.useState<string>(normalizedTipo);

  React.useEffect(() => {
    setSelectedTipoVeiculo(normalizedTipo);
    setSelectedStatus(filters?.status ?? []);
    setSelectedCombustivel(filters?.combustivel ?? []);
    setSelectedCambio(filters?.cambio ?? []);
    setSelectedCondicao(filters?.condicao ?? []);
    setSelectedLocal(filters?.local ?? []);
  }, [filters, normalizedTipo]);

  const emitFilters = React.useCallback(
    (next?: Partial<AuctionFilters>) => {
      if (!onFilterChange) return;
      const tipoSelecionado = String(next?.tipoVeiculo?.[0] ?? selectedTipoVeiculo).toUpperCase();
      const tipoVeiculo = tipoSelecionado === "TODOS" ? [] : [tipoSelecionado];
      onFilterChange({
        tipoVeiculo,
        status: next?.status ?? selectedStatus,
        combustivel: next?.combustivel ?? selectedCombustivel,
        cambio: next?.cambio ?? selectedCambio,
        condicao: next?.condicao ?? selectedCondicao,
        local: next?.local ?? selectedLocal,
      });
    },
    [onFilterChange, selectedCambio, selectedCombustivel, selectedCondicao, selectedLocal, selectedStatus, selectedTipoVeiculo]
  );

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
    setSelectedCombustivel([]);
    setSelectedCambio([]);
    setSelectedCondicao([]);
    setSelectedLocal([]);
  }

  function handleApplyFilters() {
    setIsFilterOpen(false);
    emitFilters();
  }

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 8);
  }

  React.useEffect(() => {
    updateScrollState();

    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => updateScrollState();
    const handleResize = () => updateScrollState();

    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => updateScrollState());
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  function scrollByAmount(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction === "left" ? -340 : 340,
      behavior: "smooth",
    });
  }

  return (
    <section className="w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-[1720px] px-4 md:px-6">
        <Tabs value={selectedTipoVeiculo} defaultValue={categories[0].value} className="w-full">
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4 sm:py-5">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => scrollByAmount("left")}
                aria-label="Rolar categorias para a esquerda"
                className={cn(
                  "hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-all duration-200 hover:border-[var(--nulance-purple)]/20 hover:text-[var(--nulance-purple)] lg:inline-flex",
                  !canScrollLeft && "pointer-events-none opacity-0"
                )}
              >
                <HugeiconsIcon
                  icon={ArrowLeft01Icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.9}
                />
              </button>

              <div className="relative min-w-0 flex-1">
                <div
                  className={cn(
                    "pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-white via-white/90 to-transparent",
                    !canScrollLeft && "hidden"
                  )}
                />
                <div
                  className={cn(
                    "pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-white via-white/90 to-transparent",
                    !canScrollRight && "hidden"
                  )}
                />

                <div
                  ref={scrollRef}
                  className="overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  <TabsList className="inline-flex w-max min-w-full items-stretch gap-0 border-zinc-200 bg-transparent py-0">
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category.value}
                        value={category.value}
                        onClick={() => {
                          setSelectedTipoVeiculo(category.value);
                          emitFilters({ tipoVeiculo: [category.value.toUpperCase()] });
                        }}
                        icon={
                          <HugeiconsIcon
                            icon={category.icon}
                            size={20}
                            color="currentColor"
                            strokeWidth={1.9}
                          />
                        }
                        className={cn(
                          "min-w-[160px] rounded-none border-x-0 border-t-0 border-b-2 border-transparent bg-transparent px-8 py-6 ",
                          "data-[state=active]:border-[var(--nulance-purple)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--nulance-purple)]",
                          "hover:border-transparent hover:bg-transparent hover:",
                          "[&>span:first-child]:h-14 [&>span:first-child]:w-14 [&>span:first-child]:border-zinc-200 [&>span:first-child]:bg-[#fafafa] [&>span:first-child]:text-zinc-500",
                          "data-[state=active]:[&>span:first-child]:border-[var(--nulance-purple)] data-[state=active]:[&>span:first-child]:bg-white data-[state=active]:[&>span:first-child]:text-[var(--nulance-purple)]",
                          "[&>span:last-child]:text-[15px] [&>span:last-child]:font-medium",
                          "[&_[data-slot=tabs-trigger-indicator]]:hidden"
                        )}
                      >
                        {category.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              <button
                type="button"
                onClick={() => scrollByAmount("right")}
                aria-label="Rolar categorias para a direita"
                className={cn(
                  "hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-all duration-200 hover:border-[var(--nulance-purple)]/20 hover:text-[var(--nulance-purple)] lg:inline-flex",
                  !canScrollRight && "pointer-events-none opacity-0"
                )}
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.9}
                />
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFilterOpen(true)}
              className={cn(
                "h-12 w-full shrink-0 rounded-full border-[1.5px] bg-white px-5 text-[15px] font-semibold text-[var(--nulance-purple)] transition-all duration-200 sm:h-[56px] sm:w-auto sm:px-7 sm:text-[16px]",
                "border-[var(--nulance-purple)]/80 hover:bg-[rgba(99,20,108,0.04)]"
              )}
            >
              <HugeiconsIcon
                icon={FilterHorizontalIcon}
                size={20}
                color="#63146c"
                strokeWidth={1.9}
              />
              <span className="text-[#63146c]">Filtros</span>
            </Button>
          </div>

          {categories.map((category) => (
            <TabsContent
              key={category.value}
              value={category.value}
              className="hidden"
            />
          ))}
        </Tabs>
      </div>

      <MobileFilterScreen
        open={isFilterOpen && isMobile}
        onClose={() => setIsFilterOpen(false)}
        title="Filtros"
        description="Refine sua busca para encontrar os melhores leilões."
        footer={
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
              onClick={handleApplyFilters}
              className="h-12 flex-[2] rounded-full bg-[var(--nulance-purple)] text-white hover:opacity-90"
            >
              Ver resultados
            </Button>
          </div>
        }
      >
        <HomeAuctionFilterForm
          selectedStatus={selectedStatus}
          selectedCombustivel={selectedCombustivel}
          selectedCambio={selectedCambio}
          selectedCondicao={selectedCondicao}
          selectedLocal={selectedLocal}
          toggleFilter={toggleFilter}
          setSelectedStatus={setSelectedStatus}
          setSelectedCombustivel={setSelectedCombustivel}
          setSelectedCambio={setSelectedCambio}
          setSelectedCondicao={setSelectedCondicao}
          setSelectedLocal={setSelectedLocal}
          Separator={PlainFilterSep}
        />
      </MobileFilterScreen>

      <Sheet open={isFilterOpen && !isMobile} onClose={() => setIsFilterOpen(false)} side="right">
        <SheetContent className="flex w-full max-w-[400px] flex-col overflow-hidden bg-white">
          <SheetHeader className="px-6 pt-6 pb-2">
            <SheetTitle className="text-2xl font-bold text-zinc-900">Filtros</SheetTitle>
            <SheetDescription className="text-base text-zinc-500">
              Refine sua busca para encontrar os melhores leilões.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <HomeAuctionFilterForm
              selectedStatus={selectedStatus}
              selectedCombustivel={selectedCombustivel}
              selectedCambio={selectedCambio}
              selectedCondicao={selectedCondicao}
              selectedLocal={selectedLocal}
              toggleFilter={toggleFilter}
              setSelectedStatus={setSelectedStatus}
              setSelectedCombustivel={setSelectedCombustivel}
              setSelectedCambio={setSelectedCambio}
              setSelectedCondicao={setSelectedCondicao}
              setSelectedLocal={setSelectedLocal}
              Separator={SheetSeparator}
            />
          </div>

          <div className="border-t border-zinc-100 p-6 pt-4">
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
                onClick={handleApplyFilters}
                className="h-12 flex-[2] rounded-full bg-[var(--nulance-purple)] text-white hover:opacity-90"
              >
                Ver resultados
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
