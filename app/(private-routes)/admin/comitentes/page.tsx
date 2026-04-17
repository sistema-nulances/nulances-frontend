"use client";

import * as React from "react";
import { BankIcon, Building02Icon, UserMultipleIcon } from "@hugeicons/core-free-icons";

import { AdminMetricTile } from "@/components/admin/dashboard/admin-metric-tile";
import {
  ComitenteSheet,
  type ComitenteSaveAction,
  type ComitenteSheetMode,
} from "@/components/admin/comitentes/comitente-sheet";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { ComitentesTable } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  buildComitenteStats,
  comitenteListResponseParaRow,
  comitenteResponseParaRow,
  tipoComitenteUiParaApi,
  type ComitenteRow,
} from "@/lib/admin-comitentes";
import {
  buscarComitenteStatsAdmin,
  criarComitenteAdmin,
  editarComitenteAdmin,
  excluirComitenteAdmin,
  listarComitentesAdmin,
} from "@/lib/repositories/admin-comitentes-repository";
import { ApiError } from "@/lib/repositories/types/auth.types";

const PAGE_SIZE = 10;

type ComitenteSheetState =
  | { mode: "details" | "edit"; rowId: string }
  | { mode: "create" };

export default function AdminComitentesPage() {
  const { toast } = useToast();
  const [rows, setRows] = React.useState<ComitenteRow[]>([]);
  const [statsApi, setStatsApi] = React.useState<{
    totalComitentes: number;
    totalBancos: number;
    totalSeguradoras: number;
    totalOutros: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [deleteTarget, setDeleteTarget] = React.useState<ComitenteRow | null>(null);
  const [sheet, setSheet] = React.useState<ComitenteSheetState | null>(null);

  const refreshComitentes = React.useCallback(async () => {
    setLoading(true);
    try {
      const [lista, stats] = await Promise.all([listarComitentesAdmin(), buscarComitenteStatsAdmin()]);
      setRows(lista.map(comitenteListResponseParaRow).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
      setStatsApi({
        totalComitentes: stats.totalComitentes,
        totalBancos: stats.totalBancos,
        totalSeguradoras: stats.totalSeguradoras,
        totalOutros: stats.totalEmpresas + stats.totalPessoaFisica,
      });
    } catch (e) {
      toast({
        type: "error",
        title: "Erro ao carregar comitentes",
        description: e instanceof ApiError ? e.message : "Verifique a API e tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    void refreshComitentes();
  }, [refreshComitentes]);

  const stats = React.useMemo(() => {
    if (statsApi) return statsApi;
    return buildComitenteStats(rows);
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

  const sheetMode: ComitenteSheetMode = sheet?.mode ?? "details";

  React.useEffect(() => {
    if (!sheet || sheet.mode === "create") return;
    if (!rows.some((r) => r.id === sheet.rowId)) {
      setSheet(null);
    }
  }, [rows, sheet]);

  const handleDetalhes = React.useCallback((row: ComitenteRow) => {
    setSheet({ mode: "details", rowId: row.id });
  }, []);

  const handleEditar = React.useCallback((row: ComitenteRow) => {
    setSheet({ mode: "edit", rowId: row.id });
  }, []);

  const handleSaveComitente = React.useCallback(
    async (next: ComitenteRow, action: ComitenteSaveAction) => {
      if (action === "create") {
        try {
          await criarComitenteAdmin({
            nome: next.nome.trim(),
            tipo: tipoComitenteUiParaApi(next.tipo),
            documento: next.documento.trim(),
            ativoPlataforma: next.ativo,
            sede: next.localPrincipal.trim() || null,
          });
          await refreshComitentes();
          toast({
            type: "success",
            title: "Comitente cadastrado",
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
          const current = rows.find((r) => r.id === next.id);
          const updated = await editarComitenteAdmin(next.id, {
            nome: next.nome.trim(),
            tipo: tipoComitenteUiParaApi(next.tipo),
            documento: next.documento.trim(),
            ativoPlataforma: next.ativo,
            sede: next.localPrincipal.trim() || null,
          });
          setRows((prev) =>
            prev
              .map((r) => (r.id === next.id ? comitenteResponseParaRow(updated, current ?? r) : r))
              .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
          );
          await refreshComitentes();
          toast({
            type: "success",
            title: "Comitente atualizado",
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
    [refreshComitentes, rows, toast]
  );

  const handleToggleAtivo = React.useCallback(
    async (row: ComitenteRow) => {
      try {
        await editarComitenteAdmin(row.id, { ativoPlataforma: !row.ativo });
        await refreshComitentes();
        const agoraAtivo = !row.ativo;
        toast({
          type: "success",
          title: agoraAtivo ? "Comitente reativado" : "Comitente desativado",
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
    [refreshComitentes, toast]
  );

  const handleExcluir = React.useCallback((row: ComitenteRow) => {
    setDeleteTarget(row);
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!deleteTarget) return;
    const row = deleteTarget;
    try {
      await excluirComitenteAdmin(row.id);
      await refreshComitentes();
      toast({
        type: "success",
        title: "Comitente excluído",
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
  }, [deleteTarget, refreshComitentes, toast]);

  const rangeStart = rows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, rows.length);

  return (
    <>
      <PageHeader
        title="Comitentes"
        subtitle="Cadastro e visão dos comitentes com vínculo nos lotes do leilão."
        action={
          <Button
            type="button"
            size="md"
            className="h-10 rounded-full px-5"
            disabled={loading}
            onClick={() => setSheet({ mode: "create" })}
          >
            Novo comitente
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricTile
          label="Total de comitentes"
          value={stats.totalComitentes}
          icon={UserMultipleIcon}
          accent="purple"
        />
        <AdminMetricTile label="Bancos" value={stats.totalBancos} icon={BankIcon} accent="emerald" />
        <AdminMetricTile
          label="Seguradoras"
          value={stats.totalSeguradoras}
          icon={Building02Icon}
          accent="amber"
        />
        <AdminMetricTile
          label="Empresas e PF"
          value={stats.totalOutros}
          icon={Building02Icon}
          accent="zinc"
        />
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500">
            Carregando comitentes…
          </div>
        ) : (
          <ComitentesTable
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
          Em cada linha, abra o menu de ações (três pontos) para detalhes, editar, desativar ou
          excluir. A exclusão pede confirmação no diálogo para evitar remoções acidentais.
        </p>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Excluir comitente?"
        description={
          deleteTarget ? (
            <>
              <span className="font-medium text-zinc-800">{deleteTarget.nome}</span> será removido
              da lista. Esta ação pode afetar vínculos com lotes.
            </>
          ) : null
        }
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
        confirmVariant="destructive"
        onConfirm={handleConfirmDelete}
      />

      <ComitenteSheet
        open={sheetOpen}
        onClose={() => setSheet(null)}
        mode={sheetMode}
        row={sheet?.mode === "create" ? null : sheetRow}
        onSave={handleSaveComitente}
      />
    </>
  );
}
