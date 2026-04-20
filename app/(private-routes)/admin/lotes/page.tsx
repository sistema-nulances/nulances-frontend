"use client";

import * as React from "react";
import {
  ArrowRight01Icon,
  AuctionIcon,
  CheckmarkCircle02Icon,
  HourglassIcon,
  PackageIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { useBensCatalog } from "@/components/admin/bens/bens-catalog-context";
import { LoteDetailSheet } from "@/components/admin/lotes/lote-detail-sheet";
import { LoteEditSheet } from "@/components/admin/lotes/lote-edit-sheet";
import { AdminMetricTile } from "@/components/admin/dashboard/admin-metric-tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import type { LoteAdmin, LoteAdminStatus } from "@/data/lotes-admin";
import {
  buildLoteAdminStats,
  filterLotesAdmin,
  isDraftLoteId,
  leilaoTituloParaLote,
  novoLoteAdminPlaceholder,
  type LoteStatusFilter,
} from "@/lib/admin-lotes";
import { loteListResponseParaAdmin, loteResponseParaAdmin } from "@/lib/lote-api-mapper";
import {
  buscarLoteAdminPorId,
  buscarLoteStatsAdmin,
  criarLoteAdmin,
  editarLoteAdmin,
  excluirLoteAdmin,
  listarLotesAdmin,
} from "@/lib/repositories/admin-lotes-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type { LoteListResponse } from "@/lib/repositories/types/lote.types";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 6;

const FILTERS: { id: LoteStatusFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "disponivel", label: "Disponível" },
  { id: "em_leilao", label: "Em leilão" },
  { id: "encerrado", label: "Encerrado" },
];

function statusBadge(status: LoteAdminStatus) {
  if (status === "disponivel") {
    return (
      <Badge variant="emerald" size="sm" className="normal-case tracking-normal">
        Disponível
      </Badge>
    );
  }
  if (status === "em_leilao") {
    return (
      <Badge variant="purple" size="sm" className="normal-case tracking-normal">
        Em leilão
      </Badge>
    );
  }
  return (
    <Badge variant="zinc" size="sm" className="normal-case tracking-normal">
      Encerrado
    </Badge>
  );
}

export default function AdminLotesPage() {
  const { toast } = useToast();
  const { items: catalogItems, refreshFromApi } = useBensCatalog();

  const catalogMap = React.useMemo(
    () => new Map(catalogItems.map((b) => [b.id, b])),
    [catalogItems]
  );

  const [listRaw, setListRaw] = React.useState<LoteListResponse[]>([]);
  const [statsApi, setStatsApi] = React.useState<{
    totalLotes: number;
    totalDisponiveis: number;
    totalEmLeilao: number;
    totalEncerrados: number;
  } | null>(null);
  const [listLoading, setListLoading] = React.useState(true);

  const [statusTab, setStatusTab] = React.useState<LoteStatusFilter>("disponivel");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [sheetLote, setSheetLote] = React.useState<LoteAdmin | null>(null);
  const [loteSheet, setLoteSheet] = React.useState<
    { mode: "create" | "edit"; lote: LoteAdmin } | null
  >(null);
  const [deleteTarget, setDeleteTarget] = React.useState<LoteAdmin | null>(null);
  const [openingEditId, setOpeningEditId] = React.useState<string | null>(null);

  const rows = React.useMemo(
    () => listRaw.map((r) => loteListResponseParaAdmin(r, catalogMap)),
    [listRaw, catalogMap]
  );

  const stats = React.useMemo(() => {
    if (statsApi) {
      return {
        totalLotes: statsApi.totalLotes,
        totalBens: rows.reduce((acc, l) => acc + l.itens.length, 0),
        disponivel: statsApi.totalDisponiveis,
        emLeilao: statsApi.totalEmLeilao,
        encerrado: statsApi.totalEncerrados,
      };
    }
    return buildLoteAdminStats(rows);
  }, [statsApi, rows]);

  const refreshLotes = React.useCallback(async () => {
    setListLoading(true);
    try {
      const [lista, st] = await Promise.all([listarLotesAdmin(), buscarLoteStatsAdmin()]);
      setListRaw(lista);
      setStatsApi(st);
    } catch (e) {
      toast({
        type: "error",
        title: "Erro ao carregar lotes",
        description: e instanceof ApiError ? e.message : "Verifique a API e tente novamente.",
      });
    } finally {
      setListLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void refreshLotes();
  }, [refreshLotes]);

  const filtered = React.useMemo(
    () => filterLotesAdmin(rows, statusTab, search),
    [rows, statusTab, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  React.useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  React.useEffect(() => {
    setPage(1);
  }, [statusTab, search]);

  const paginated = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const sheetLoteLive = React.useMemo(() => {
    if (!sheetLote) return null;
    return rows.find((r) => r.id === sheetLote.id) ?? sheetLote;
  }, [rows, sheetLote]);

  React.useEffect(() => {
    if (!sheetLote) return;
    if (!rows.some((r) => r.id === sheetLote.id)) {
      setSheetLote(null);
    }
  }, [rows, sheetLote]);

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);

  const handleSaveLote = React.useCallback(
    async (next: LoteAdmin) => {
      try {
        if (isDraftLoteId(next.id)) {
          await criarLoteAdmin({
            nome: next.titulo.trim(),
            observacoes: next.observacoes?.trim() || null,
            bemIds: next.itens.map((i) => i.id),
          });
          toast({
            type: "success",
            title: "Lote criado",
            description: `O lote "${next.titulo.trim()}" foi registrado na API.`,
          });
        } else {
          await editarLoteAdmin(next.id, {
            nome: next.titulo.trim(),
            observacoes: next.observacoes?.trim() || null,
            bemIds: next.itens.map((i) => i.id),
          });
          toast({
            type: "success",
            title: "Lote atualizado",
            description: `"${next.codigo}" foi salvo.`,
          });
        }
        await refreshFromApi();
        await refreshLotes();
      } catch (e) {
        toast({
          type: "error",
          title: "Não foi possível salvar",
          description: e instanceof ApiError ? e.message : "Tente novamente.",
        });
        throw e;
      }
    },
    [refreshFromApi, refreshLotes, toast]
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!deleteTarget) return;
    const row = deleteTarget;
    try {
      await excluirLoteAdmin(row.id);
      toast({
        type: "success",
        title: "Lote excluído",
        description: `"${row.codigo}" foi removido.`,
      });
      await refreshFromApi();
      await refreshLotes();
      setSheetLote((prev) => (prev?.id === row.id ? null : prev));
      setLoteSheet((prev) => (prev?.lote.id === row.id ? null : prev));
    } catch (e) {
      toast({
        type: "error",
        title: "Exclusão não permitida",
        description: e instanceof ApiError ? e.message : "Tente novamente.",
      });
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, refreshFromApi, refreshLotes, toast]);

  const handleOpenEditSheet = React.useCallback(
    async (lote: LoteAdmin) => {
      setOpeningEditId(lote.id);
      try {
        const detalhe = await buscarLoteAdminPorId(lote.id);
        const loteCompleto = loteResponseParaAdmin(detalhe, catalogMap);
        setLoteSheet({ mode: "edit", lote: loteCompleto });
      } catch (e) {
        toast({
          type: "error",
          title: "Não foi possível abrir a edição",
          description: e instanceof ApiError ? e.message : "Tente novamente.",
        });
      } finally {
        setOpeningEditId(null);
      }
    },
    [catalogMap, toast]
  );

  return (
    <>
      <PageHeader
        title="Lotes"
        subtitle="Organize seus lotes com facilidade: acompanhe os códigos, os bens vinculados e um resumo rápido dos totais em um só lugar."
        action={
          <Button
            type="button"
            size="md"
            className="rounded-full"
            disabled={listLoading}
            onClick={() => setLoteSheet({ mode: "create", lote: novoLoteAdminPlaceholder() })}
          >
            <PlusIcon className="h-4 w-4" aria-hidden />
            Novo lote
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricTile
          label="Lotes cadastrados"
          value={stats.totalLotes}
          icon={PackageIcon}
          accent="purple"
        />
        <AdminMetricTile
          label="Disponíveis"
          value={stats.disponivel}
          icon={CheckmarkCircle02Icon}
          accent="emerald"
          hint="Podem ir para um leilão"
        />
        <AdminMetricTile
          label="Em leilão"
          value={stats.emLeilao}
          icon={HourglassIcon}
          accent="purple"
        />
        <AdminMetricTile
          label="Encerrados"
          value={stats.encerrado}
          icon={AuctionIcon}
          accent="zinc"
          hint="Já disputados"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(0,20rem)] lg:items-center">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filtrar lotes por status"
        >
          {FILTERS.map((f) => {
            const active = statusTab === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusTab(f.id)}
                disabled={listLoading}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--nulance-purple)] text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                  listLoading && "opacity-60"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <div className="relative w-full min-w-0">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar por código, título, bem ou leilão…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar lotes"
            className="rounded-2xl pl-10"
            disabled={listLoading}
          />
        </div>
      </div>

      <p className="mb-4 text-xs text-zinc-500">
        Lista padrão: apenas lotes <strong className="font-medium text-zinc-700">disponíveis</strong>{" "}
        para vinculação. Use &quot;Todos&quot; para ver o histórico. Lotes disponíveis podem ser editados
        ou excluídos na API.
      </p>

      {listLoading ? (
        <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500">
          Carregando lotes…
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500">
          Nenhum lote neste filtro.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((lote) => {
            const leilaoNome = leilaoTituloParaLote(lote.leilaoId);
            const n = lote.itens.length;
            const disponivel = lote.status === "disponivel";
            return (
              <li key={lote.id}>
                <article
                  className={cn(
                    "flex h-full flex-col rounded-[22px] border border-zinc-300 bg-white p-5 transition-colors",
                    "hover:border-[var(--nulance-purple)]/45"
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400">
                      {lote.codigo}
                    </p>
                    {statusBadge(lote.status)}
                  </div>
                  <h2 className="mt-4 text-[16px] font-bold leading-snug text-zinc-900">{lote.titulo}</h2>
                  <p className="mt-3 text-sm text-zinc-600">
                    <span className="font-semibold text-zinc-800">{n}</span>{" "}
                    {n === 1 ? "bem catalogado" : "bens catalogados"}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-1 text-sm text-zinc-500">
                    <span className="text-zinc-400">Leilão:</span>
                    {leilaoNome ? (
                      <span className="font-medium text-zinc-800">{leilaoNome}</span>
                    ) : (
                      <span className="italic text-zinc-500">—</span>
                    )}
                  </p>

                  {disponivel ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="rounded-full"
                        loading={openingEditId === lote.id}
                        disabled={openingEditId !== null}
                        onClick={() => void handleOpenEditSheet(lote)}
                      >
                        <PencilSquareIcon className="h-4 w-4" aria-hidden />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-red-700 hover:bg-red-50 hover:text-red-800"
                        onClick={() => setDeleteTarget(lote)}
                      >
                        <TrashIcon className="h-4 w-4" aria-hidden />
                        Excluir
                      </Button>
                    </div>
                  ) : null}

                  <div className={cn("flex flex-1 flex-col justify-end pt-2", disponivel ? "mt-3" : "mt-5")}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      className="w-full rounded-full"
                      onClick={() => setSheetLote(lote)}
                    >
                      Ver lote
                      <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length > 0 && !listLoading ? (
        <p className="mt-8 text-center text-xs text-zinc-500">
          Mostrando {rangeStart}–{rangeEnd} de {filtered.length}
        </p>
      ) : null}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-6"
      />

      <LoteDetailSheet
        open={sheetLote !== null}
        onClose={() => setSheetLote(null)}
        lote={sheetLoteLive}
      />

      <LoteEditSheet
        open={loteSheet !== null}
        onClose={() => setLoteSheet(null)}
        lote={loteSheet?.lote ?? null}
        mode={loteSheet?.mode ?? "edit"}
        onSave={handleSaveLote}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(openDialog) => {
          if (!openDialog) setDeleteTarget(null);
        }}
        title="Excluir lote?"
        description={
          deleteTarget ? (
            <>
              O lote <span className="font-medium text-zinc-800">{deleteTarget.codigo}</span> será removido
              na API. Os bens voltam para status disponível.
            </>
          ) : null
        }
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
