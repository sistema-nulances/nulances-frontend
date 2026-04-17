"use client";

import * as React from "react";
import {
  AuctionIcon,
  LegalHammerIcon,
  UserMultipleIcon,
  UserRemove01Icon,
} from "@hugeicons/core-free-icons";

import { AdminMetricTile } from "@/components/admin/dashboard/admin-metric-tile";
import {
  LeiloeiroSheet,
  type LeiloeiroSaveAction,
  type LeiloeiroSheetMode,
} from "@/components/admin/leiloeiros/leiloeiro-sheet";
import { LeiloeirosTable } from "@/components/admin/leiloeiros/leiloeiros-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import {
  buildLeiloeiroStats,
  leiloeiroListResponseParaRow,
  leiloeiroResponseParaRow,
  type LeiloeiroRow,
} from "@/lib/admin-leiloeiros";
import {
  buscarLeiloeiroStatsAdmin,
  criarLeiloeiroAdmin,
  editarLeiloeiroAdmin,
  excluirLeiloeiroAdmin,
  listarLeiloeirosAdmin,
} from "@/lib/repositories/admin-leiloeiros-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";

const PAGE_SIZE = 10;

type LeiloeiroSheetState =
  | { mode: "details" | "edit"; rowId: string }
  | { mode: "create" };

export default function AdminLeiloeirosPage() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<LeiloeiroRow[]>([]);
  const [statsApi, setStatsApi] = React.useState<{
    totalLeiloeiros: number;
    totalAtivos: number;
    totalInativos: number;
    comLeiloes: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [deleteTarget, setDeleteTarget] = React.useState<LeiloeiroRow | null>(null);
  const [sheet, setSheet] = React.useState<LeiloeiroSheetState | null>(null);

  const refreshLeiloeiros = React.useCallback(async () => {
    setLoading(true);
    try {
      const [lista, stats] = await Promise.all([listarLeiloeirosAdmin(), buscarLeiloeiroStatsAdmin()]);
      const parsedRows = lista
        .map(leiloeiroListResponseParaRow)
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      setRows(parsedRows);
      setStatsApi({
        totalLeiloeiros: stats.totalLeiloeiros,
        totalAtivos: stats.totalLeiloeirosAtivosPlataforma,
        totalInativos: stats.totalLeiloeirosInativosPlataforma,
        comLeiloes: stats.totalLeiloeirosComLeilaoVinculado,
      });
    } catch (e) {
      toast({
        type: "error",
        title: "Erro ao carregar leiloeiros",
        description: e instanceof ApiError ? e.message : "Verifique a API e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void refreshLeiloeiros();
  }, [refreshLeiloeiros]);

  const stats = React.useMemo(() => {
    if (statsApi) return statsApi;
    return buildLeiloeiroStats(rows);
  }, [rows, statsApi]);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  React.useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const paginatedRows = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  const sheetRow = React.useMemo(() => {
    if (!sheet || sheet.mode === "create") return null;
    return rows.find((r) => r.id === sheet.rowId) ?? null;
  }, [sheet, rows]);

  const sheetOpen = sheet !== null && (sheet.mode === "create" || sheetRow !== null);
  const sheetMode: LeiloeiroSheetMode = sheet?.mode ?? "details";

  React.useEffect(() => {
    if (!sheet || sheet.mode === "create") return;
    if (!rows.some((r) => r.id === sheet.rowId)) {
      setSheet(null);
    }
  }, [rows, sheet]);

  const handleDetalhes = React.useCallback((row: LeiloeiroRow) => {
    setSheet({ mode: "details", rowId: row.id });
  }, []);

  const handleEditar = React.useCallback((row: LeiloeiroRow) => {
    setSheet({ mode: "edit", rowId: row.id });
  }, []);

  const handleSaveLeiloeiro = React.useCallback(
    async (next: LeiloeiroRow, action: LeiloeiroSaveAction) => {
      if (action === "create") {
        try {
          await criarLeiloeiroAdmin({
            nome: next.nome.trim(),
            registroProfissional: next.registro.trim(),
            cpf: next.documento,
            email: next.email.trim(),
            telefone: next.telefone.trim() || null,
            local: next.localPrincipal.trim() || null,
          });
          await refreshLeiloeiros();
          toast({
            type: "success",
            title: "Leiloeiro cadastrado",
            description: `"${next.nome}" foi adicionado à lista.`,
          });
        } catch (e) {
          toast({
            type: "error",
            title: "Não foi possível cadastrar",
            description: e instanceof ApiError ? e.message : "Tente novamente.",
          });
          throw e;
        }
      } else {
        try {
          const updated = await editarLeiloeiroAdmin(next.id, {
            nome: next.nome.trim(),
            registroProfissional: next.registro.trim(),
            cpf: next.documento,
            email: next.email.trim(),
            telefone: next.telefone.trim() || null,
            local: next.localPrincipal.trim() || null,
            ativoPlataforma: next.ativo,
          });
          setRows((prev) =>
            prev
              .map((r) => (r.id === next.id ? leiloeiroResponseParaRow(updated) : r))
              .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
          );
          await refreshLeiloeiros();
          toast({
            type: "success",
            title: "Leiloeiro atualizado",
            description: `Os dados de "${next.nome}" foram salvos.`,
          });
        } catch (e) {
          toast({
            type: "error",
            title: "Não foi possível atualizar",
            description: e instanceof ApiError ? e.message : "Tente novamente.",
          });
          throw e;
        }
      }
    },
    [refreshLeiloeiros, toast]
  );

  const handleToggleAtivo = React.useCallback(
    async (row: LeiloeiroRow) => {
      try {
        await editarLeiloeiroAdmin(row.id, { ativoPlataforma: !row.ativo });
        await refreshLeiloeiros();
        const agoraAtivo = !row.ativo;
        toast({
          type: "success",
          title: agoraAtivo ? "Leiloeiro reativado" : "Leiloeiro desativado",
          description: agoraAtivo
            ? `${row.nome} voltou a ficar disponível para novos vínculos.`
            : `${row.nome} foi marcado como inativo.`,
        });
      } catch (e) {
        toast({
          type: "error",
          title: "Não foi possível alterar status",
          description: e instanceof ApiError ? e.message : "Tente novamente.",
        });
      }
    },
    [refreshLeiloeiros, toast]
  );

  const handleExcluir = React.useCallback((row: LeiloeiroRow) => {
    setDeleteTarget(row);
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!deleteTarget) return;
    const row = deleteTarget;
    try {
      await excluirLeiloeiroAdmin(row.id);
      await refreshLeiloeiros();
      toast({
        type: "success",
        title: "Leiloeiro excluído",
        description: `${row.nome} foi removido da lista.`,
      });
      setSheet((prev) => (prev && prev.mode !== "create" && prev.rowId === row.id ? null : prev));
    } catch (e) {
      toast({
        type: "error",
        title: "Exclusão não permitida",
        description: e instanceof ApiError ? e.message : "Tente novamente.",
      });
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, refreshLeiloeiros, toast]);

  const rangeStart = rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, rows.length);

  return (
    <>
      <PageHeader
        title="Leiloeiros"
        subtitle="Cadastro e gestão dos leiloeiros habilitados na plataforma."
        action={
          <Button
            type="button"
            size="md"
            className="h-10 rounded-full px-5"
            disabled={loading}
            onClick={() => setSheet({ mode: "create" })}
          >
            Novo leiloeiro
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricTile
          label="Total de leiloeiros"
          value={stats.totalLeiloeiros}
          icon={LegalHammerIcon}
          accent="purple"
        />
        <AdminMetricTile
          label="Ativos"
          value={stats.totalAtivos}
          icon={UserMultipleIcon}
          accent="emerald"
        />
        <AdminMetricTile
          label="Inativos"
          value={stats.totalInativos}
          icon={UserRemove01Icon}
          accent="zinc"
        />
        <AdminMetricTile
          label="Com leilões vinculados"
          value={stats.comLeiloes}
          icon={AuctionIcon}
          accent="amber"
        />
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500">
            Carregando leiloeiros…
          </div>
        ) : (
          <LeiloeirosTable
            rows={paginatedRows}
            onDetalhes={handleDetalhes}
            onEditar={handleEditar}
            onToggleAtivo={(row) => void handleToggleAtivo(row)}
            onExcluir={handleExcluir}
          />
        )}
        {rows.length > 0 ? (
          <p className="mt-4 text-center text-xs text-zinc-500">
            Mostrando {rangeStart}–{rangeEnd} de {rows.length}
          </p>
        ) : null}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mt-4"
        />
        <p className="mx-auto mt-3 max-w-xl text-center text-[11px] leading-snug text-zinc-500">
          Use o menu de ações em cada linha para detalhes, editar, desativar ou excluir. A exclusão
          exige confirmação.
        </p>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Excluir leiloeiro?"
        description={
          deleteTarget ? (
            <>
              <span className="font-medium text-zinc-800">{deleteTarget.nome}</span> será removido
              da lista. Esta ação pode afetar vínculos com leilões.
            </>
          ) : null
        }
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
      />

      <LeiloeiroSheet
        open={sheetOpen}
        onClose={() => setSheet(null)}
        mode={sheetMode}
        row={sheet?.mode === "create" ? null : sheetRow}
        onSave={handleSaveLeiloeiro}
      />
    </>
  );
}
