"use client";

import * as React from "react";
import { Archive01Icon, AuctionIcon, Clock01Icon, LegalHammerIcon } from "@hugeicons/core-free-icons";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { useBensCatalog } from "@/components/admin/bens/bens-catalog-context";
import { LeilaoCard } from "@/components/admin/leiloes/leilao-card";
import {
  NovoLeilaoSheet,
  type NovoLeilaoLoteOption,
  type NovoLeilaoSimpleOption,
} from "@/components/admin/leiloes/novo-leilao-sheet";
import { AdminMetricTile } from "@/components/admin/dashboard/admin-metric-tile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import type { LeilaoAdmin } from "@/data/leiloes-admin";
import {
  buildLeilaoStats,
  filterLeiloes,
  leilaoResponseParaAdmin,
  type LeilaoStatusFilter,
} from "@/lib/admin-leiloes";
import { cn } from "@/lib/cn";
import { listarComitentesAdmin } from "@/lib/repositories/admin-comitentes-repository";
import { criarLeilaoAdmin, listarLeiloesAdmin } from "@/lib/repositories/admin-leiloes-repository";
import { listarLeiloeirosAdmin } from "@/lib/repositories/admin-leiloeiros-repository";
import { buscarLoteAdminPorId, listarLotesAdmin } from "@/lib/repositories/admin-lotes-repository";
import type { LeilaoCreateRequest } from "@/lib/repositories/types/leilao.types";

const PAGE_SIZE = 6;

const FILTERS: { id: LeilaoStatusFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "ABERTO", label: "Ao vivo" },
  { id: "EM_BREVE", label: "Em breve" },
  { id: "ENCERRADO", label: "Encerrados" },
];

export default function AdminLeiloesPage() {
  const { toast } = useToast();
  const { items: bensCatalogo } = useBensCatalog();
  const bensMap = React.useMemo(() => new Map(bensCatalogo.map((b) => [b.id, b])), [bensCatalogo]);

  const [rows, setRows] = React.useState<LeilaoAdmin[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [novoOpen, setNovoOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<LeilaoStatusFilter>("todos");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [leiloeiroOptions, setLeiloeiroOptions] = React.useState<NovoLeilaoSimpleOption[]>([]);
  const [comitenteOptions, setComitenteOptions] = React.useState<NovoLeilaoSimpleOption[]>([]);
  const [loteOptions, setLoteOptions] = React.useState<NovoLeilaoLoteOption[]>([]);

  const stats = React.useMemo(() => buildLeilaoStats(rows), [rows]);

  const refreshLeiloes = React.useCallback(async () => {
    setLoading(true);
    try {
      const [leiloes, leiloeiros, comitentes, lotes] = await Promise.all([
        listarLeiloesAdmin(),
        listarLeiloeirosAdmin(),
        listarComitentesAdmin(),
        listarLotesAdmin(),
      ]);

      const leiloeiroMap = new Map(leiloeiros.map((l) => [l.id, l.nome]));
      const comitenteMap = new Map(comitentes.map((c) => [c.id, c.nome]));
      setLeiloeiroOptions(
        leiloeiros.filter((l) => l.ativoPlataforma).map((l) => ({ value: l.id, label: l.nome }))
      );
      setComitenteOptions(
        comitentes
          .filter((c) => String(c.status ?? "").toUpperCase() === "ATIVO")
          .map((c) => ({ value: c.id, label: c.nome }))
      );

      const lotesDisponiveis = lotes.filter((l) => String(l.status).toUpperCase() === "DISPONIVEL");
      const lotesDetalhes = await Promise.all(lotesDisponiveis.map((l) => buscarLoteAdminPorId(l.id)));
      const nextLoteOptions: NovoLeilaoLoteOption[] = [];
      for (const lote of lotesDetalhes) {
        const bemIds = lote.bemIds ?? [];
        const qtd = bemIds.length;
        nextLoteOptions.push({
          value: lote.id,
          bens: bemIds.map((id) => {
            const bem = bensMap.get(id);
            return { id, label: bem?.nome ?? `Bem ${id.slice(0, 8)}...` };
          }),
          label: `${lote.codigo} (${qtd} bens)`,
        });
      }
      setLoteOptions(nextLoteOptions);

      setRows(
        leiloes.map((l) =>
          leilaoResponseParaAdmin(
            l,
            leiloeiroMap.get(l.leiloeiroId) ?? "Leiloeiro",
            comitenteMap.get(l.comitenteId) ?? "Comitente"
          )
        )
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Verifique a API e tente novamente.";
      toast({ type: "error", title: "Erro ao carregar leilões", description: msg });
    } finally {
      setLoading(false);
    }
  }, [bensMap, toast]);

  React.useEffect(() => {
    void refreshLeiloes();
  }, [refreshLeiloes]);

  const filtered = React.useMemo(
    () => filterLeiloes(rows, statusFilter, search),
    [rows, statusFilter, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  React.useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const pageSlice = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <>
      <NovoLeilaoSheet
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        loteOptions={loteOptions}
        leiloeiroOptions={leiloeiroOptions}
        comitenteOptions={comitenteOptions}
        onSave={async (payload: LeilaoCreateRequest) => {
          await criarLeilaoAdmin(payload);
          await refreshLeiloes();
          toast({
            type: "success",
            title: "Leilão criado",
            description: "Leilão registrado com sucesso na API.",
          });
        }}
      />
      <PageHeader
        title="Leilões"
        subtitle="Eventos com lotes, datas e leiloeiro — visão em cartões para escanear rápido."
        action={
          <Button
            type="button"
            size="md"
            className="h-10 rounded-full px-5"
            disabled={loading}
            onClick={() => setNovoOpen(true)}
          >
            Novo leilão
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricTile label="Total de leilões" value={stats.total} icon={AuctionIcon} accent="purple" />
        <AdminMetricTile
          label="Ao vivo"
          value={stats.porStatus.ABERTO}
          icon={LegalHammerIcon}
          accent="emerald"
        />
        <AdminMetricTile
          label="Em breve"
          value={stats.porStatus.EM_BREVE}
          icon={Clock01Icon}
          accent="amber"
        />
        <AdminMetricTile
          label="Encerrados"
          value={stats.porStatus.ENCERRADO}
          icon={Archive01Icon}
          accent="zinc"
        />
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por status">
          {FILTERS.map((f) => {
            const on = statusFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  on
                    ? "border-[var(--nulance-purple)] bg-[var(--nulance-purple)] text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <div className="w-full min-w-0 lg:max-w-sm">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, cidade ou leiloeiro…"
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5" aria-hidden />}
            className="rounded-2xl"
            aria-label="Buscar leilões"
          />
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-[22px] border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500">
            Carregando leilões...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-zinc-400 bg-zinc-50 px-6 py-16 text-center">
            <p className="text-sm font-medium text-zinc-700">Nenhum leilão encontrado.</p>
            <p className="mt-1 text-sm text-zinc-500">Ajuste o filtro ou o termo de busca.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {pageSlice.map((leilao) => (
              <li key={leilao.id}>
                <LeilaoCard leilao={leilao} />
              </li>
            ))}
          </ul>
        )}

        {filtered.length > 0 ? (
          <>
            <p className="mt-6 text-center text-xs text-zinc-500">
              Mostrando {rangeStart}–{rangeEnd} de {filtered.length}
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-4"
            />
          </>
        ) : null}
      </div>
    </>
  );
}
