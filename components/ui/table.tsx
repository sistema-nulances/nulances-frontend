"use client";

import * as React from "react";
import type { ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  Edit02Icon,
  FileViewIcon,
  MoreVerticalIcon,
  PowerIcon,
  PowerOffIcon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemContent,
  DropdownMenuItemIcon,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/cn";
import type { ComitenteRow } from "@/lib/admin-comitentes";

export type DataTableColumn<Row> = {
  id: string;
  header: React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: "left" | "center" | "right";
  cell: (row: Row, rowIndex: number) => React.ReactNode;
};

export type DataTableProps<Row> = {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getRowId: (row: Row) => string;
  getRowClassName?: (row: Row, rowIndex: number) => string | undefined;
  caption?: React.ReactNode;
  "aria-label"?: string;
  emptyTitle: string;
  emptyDescription?: string;
  minTableWidth?: number | string;
  className?: string;
};

function alignClass(align: "left" | "center" | "right" | undefined) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

export function DataTable<Row>({
  columns,
  rows,
  getRowId,
  getRowClassName,
  caption,
  ["aria-label"]: ariaLabel,
  emptyTitle,
  emptyDescription,
  minTableWidth = 960,
  className,
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return (
      <section
        className={cn(
          "rounded-3xl bg-white p-8 ring-1 ring-zinc-200",
          className
        )}
        role="region"
        aria-label={ariaLabel}
      >
        <h2 className="text-base font-semibold text-zinc-900">{emptyTitle}</h2>
        {emptyDescription ? (
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
            {emptyDescription}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className={cn("overflow-hidden rounded-3xl bg-white ring-1 ring-zinc-200", className)}
    >
      <div className="overflow-x-auto">
        <table
          className="w-full text-left text-sm"
          style={{
            minWidth: typeof minTableWidth === "number" ? `${minTableWidth}px` : minTableWidth,
          }}
          aria-label={ariaLabel}
        >
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={cn(
                    "px-3 py-3 first:pl-6 first:sm:pl-8 last:pr-6 last:sm:pr-8",
                    alignClass(col.align),
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={getRowId(row)}
                className={cn(
                  "border-b border-zinc-100/80 transition-colors last:border-b-0",
                  "hover:bg-zinc-50/90 focus-within:bg-zinc-50/90",
                  getRowClassName?.(row, rowIndex)
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={cn(
                      "px-3 py-4 align-middle first:pl-6 first:sm:pl-8 last:pr-6 last:sm:pr-8",
                      alignClass(col.align),
                      col.cellClassName
                    )}
                  >
                    {col.cell(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function tipoToVariant(tipo: ComitenteRow["tipo"]): ComponentProps<typeof Badge>["variant"] {
  if (tipo === "Banco") return "purple";
  if (tipo === "Seguradora") return "amber";
  if (tipo === "Empresa") return "emerald";
  return "zinc";
}

function tipoBadgeLabel(tipo: ComitenteRow["tipo"]): string {
  return tipo === "Pessoa Física" ? "PF" : tipo;
}

type ComitenteRowActionsProps = {
  row: ComitenteRow;
  onDetalhes: (row: ComitenteRow) => void;
  onEditar: (row: ComitenteRow) => void;
  onToggleAtivo: (row: ComitenteRow) => void;
  onExcluir: (row: ComitenteRow) => void;
};

function ComitenteRowActionsMenu({
  row,
  onDetalhes,
  onEditar,
  onToggleAtivo,
  onExcluir,
}: ComitenteRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 text-zinc-600 hover:text-zinc-900"
          aria-label={`Ações para ${row.nome}`}
        >
          <HugeiconsIcon icon={MoreVerticalIcon} size={22} strokeWidth={1.75} aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[280px]">
        <DropdownMenuItem onClick={() => onDetalhes(row)}>
          <DropdownMenuItemIcon>
            <HugeiconsIcon icon={FileViewIcon} size={20} strokeWidth={1.75} />
          </DropdownMenuItemIcon>
          <DropdownMenuItemContent
            title="Ver detalhes"
            description="Resumo rápido do cadastro e dos lotes"
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditar(row)}>
          <DropdownMenuItemIcon>
            <HugeiconsIcon icon={Edit02Icon} size={20} strokeWidth={1.75} />
          </DropdownMenuItemIcon>
          <DropdownMenuItemContent title="Editar" description="Alterar dados do comitente" />
        </DropdownMenuItem>
        <DropdownMenuItem
          className={
            row.ativo
              ? "text-red-700 hover:bg-red-50 hover:text-red-900 focus-visible:ring-red-200/60"
              : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900 focus-visible:ring-emerald-200/60"
          }
          onClick={() => onToggleAtivo(row)}
        >
          <DropdownMenuItemIcon
            className={
              row.ativo
                ? "border-red-100 bg-red-50/90 text-red-700 group-hover:border-red-200 group-hover:bg-red-50"
                : "border-emerald-100 bg-emerald-50/90 text-emerald-700 group-hover:border-emerald-200 group-hover:bg-emerald-50"
            }
          >
            <HugeiconsIcon
              icon={row.ativo ? PowerOffIcon : PowerIcon}
              size={20}
              strokeWidth={1.75}
            />
          </DropdownMenuItemIcon>
          <DropdownMenuItemContent
            tone={row.ativo ? "danger" : "success"}
            title={row.ativo ? "Desativar" : "Reativar"}
            description={
              row.ativo
                ? "Oculta o comitente de novos vínculos"
                : "Restaura o comitente para uso"
            }
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-700 hover:bg-red-50 hover:text-red-900 focus-visible:ring-red-200/60"
          onClick={() => onExcluir(row)}
        >
          <DropdownMenuItemIcon className="border-red-100 bg-red-50/90 text-red-700 group-hover:border-red-200 group-hover:bg-red-50">
            <HugeiconsIcon icon={Delete02Icon} size={20} strokeWidth={1.75} />
          </DropdownMenuItemIcon>
          <DropdownMenuItemContent
            tone="danger"
            title="Excluir"
            description="Remove o registro após confirmação"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type ComitentesTableProps = {
  rows: ComitenteRow[];
  onDetalhes: (row: ComitenteRow) => void;
  onEditar: (row: ComitenteRow) => void;
  onToggleAtivo: (row: ComitenteRow) => void;
  onExcluir: (row: ComitenteRow) => void;
};

export function ComitentesTable({
  rows,
  onDetalhes,
  onEditar,
  onToggleAtivo,
  onExcluir,
}: ComitentesTableProps) {
  const columns: DataTableColumn<ComitenteRow>[] = [
    {
      id: "nome",
      header: "Comitente",
      headerClassName: "min-w-[160px]",
      cellClassName: "min-w-[160px]",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-zinc-900">{row.nome}</span>
          {!row.ativo ? (
            <span className="text-[11px] font-medium text-zinc-500">Inativo na plataforma</span>
          ) : null}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      align: "left",
      cell: (row) => (
        <Badge variant={row.ativo ? "emerald" : "zinc"} size="sm" className="normal-case tracking-normal">
          {row.ativo ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      id: "tipo",
      header: "Tipo",
      cell: (row) => (
        <Badge variant={tipoToVariant(row.tipo)} size="sm" className="normal-case tracking-normal">
          {tipoBadgeLabel(row.tipo)}
        </Badge>
      ),
    },
    {
      id: "documento",
      header: "Documento",
      cellClassName: "whitespace-nowrap text-zinc-600",
      cell: (row) => row.documento,
    },
    {
      id: "lotes",
      header: "Lotes",
      align: "center",
      cellClassName: "font-semibold text-zinc-900",
      cell: (row) => row.totalLotes,
    },
    {
      id: "abertos",
      header: "Abertos",
      align: "center",
      cellClassName: "text-emerald-700",
      cell: (row) => row.lotesAbertos,
    },
    {
      id: "breve",
      header: "Em breve",
      align: "center",
      cellClassName: "text-amber-700",
      cell: (row) => row.lotesEmBreve,
    },
    {
      id: "encerrados",
      header: "Encerrados",
      align: "center",
      cellClassName: "text-zinc-600",
      cell: (row) => row.lotesEncerrados,
    },
    {
      id: "acoes",
      header: <span className="sr-only">Ações</span>,
      align: "right",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <ComitenteRowActionsMenu
          row={row}
          onDetalhes={onDetalhes}
          onEditar={onEditar}
          onToggleAtivo={onToggleAtivo}
          onExcluir={onExcluir}
        />
      ),
    },
  ];

  const tableProps = {
    columns,
    rows,
    getRowId: (r: ComitenteRow) => r.id,
    getRowClassName: (row: ComitenteRow) =>
      row.ativo ? undefined : ("opacity-[0.78] bg-zinc-50/40" as const),
    minTableWidth: 880,
    "aria-label": "Tabela de comitentes do leilão" as const,
    caption:
      "Comitentes cadastrados com totais de lotes por status. Cada linha oferece um menu de ações.",
    emptyTitle: "Nenhum comitente cadastrado",
    emptyDescription:
      "Quando houver comitentes, eles aparecerão aqui com totais de lotes e ações de gestão.",
  };

  if (rows.length === 0) {
    return <DataTable {...tableProps} />;
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 md:hidden" role="list" aria-label="Lista de comitentes">
        {rows.map((row) => (
          <li key={row.id}>
            <article
              className={cn(
                "rounded-3xl bg-white p-5 ring-1 ring-zinc-200",
                !row.ativo && "bg-zinc-50/40 opacity-[0.78]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold leading-snug text-zinc-900">{row.nome}</h3>
                  {!row.ativo ? (
                    <p className="mt-0.5 text-[11px] font-medium text-zinc-500">
                      Inativo na plataforma
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge
                      variant={row.ativo ? "emerald" : "zinc"}
                      size="sm"
                      className="normal-case tracking-normal"
                    >
                      {row.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge
                      variant={tipoToVariant(row.tipo)}
                      size="sm"
                      className="normal-case tracking-normal"
                    >
                      {tipoBadgeLabel(row.tipo)}
                    </Badge>
                  </div>
                </div>
                <ComitenteRowActionsMenu
                  row={row}
                  onDetalhes={onDetalhes}
                  onEditar={onEditar}
                  onToggleAtivo={onToggleAtivo}
                  onExcluir={onExcluir}
                />
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    Documento
                  </dt>
                  <dd className="mt-0.5 break-all text-zinc-700">{row.documento}</dd>
                </div>
              </dl>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Lotes", value: row.totalLotes, className: "font-semibold text-zinc-900" },
                  { label: "Abertos", value: row.lotesAbertos, className: "text-emerald-700" },
                  { label: "Em breve", value: row.lotesEmBreve, className: "text-amber-700" },
                  { label: "Encerrados", value: row.lotesEncerrados, className: "text-zinc-600" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl bg-zinc-50/90 px-3 py-2 ring-1 ring-zinc-100"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                      {s.label}
                    </p>
                    <p className={cn("mt-0.5 text-lg tabular-nums", s.className)}>{s.value}</p>
                  </div>
                ))}
              </div>
            </article>
          </li>
        ))}
      </ul>
      <div className="hidden md:block">
        <DataTable {...tableProps} />
      </div>
    </>
  );
}
