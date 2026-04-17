"use client";

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
import { DataTable, type DataTableColumn } from "@/components/ui/table";
import { cn } from "@/lib/cn";
import type { LeiloeiroRow } from "@/lib/admin-leiloeiros";
import { formatCpfOuCnpjExibicao } from "@/lib/formatters";

export type LeiloeirosTableProps = {
  rows: LeiloeiroRow[];
  onDetalhes: (row: LeiloeiroRow) => void;
  onEditar: (row: LeiloeiroRow) => void;
  onToggleAtivo: (row: LeiloeiroRow) => void;
  onExcluir: (row: LeiloeiroRow) => void;
};

type LeiloeiroRowActionsProps = {
  row: LeiloeiroRow;
  onDetalhes: (row: LeiloeiroRow) => void;
  onEditar: (row: LeiloeiroRow) => void;
  onToggleAtivo: (row: LeiloeiroRow) => void;
  onExcluir: (row: LeiloeiroRow) => void;
};

function LeiloeiroRowActionsMenu({
  row,
  onDetalhes,
  onEditar,
  onToggleAtivo,
  onExcluir,
}: LeiloeiroRowActionsProps) {
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
            description="Resumo do cadastro e leilões vinculados"
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEditar(row)}>
          <DropdownMenuItemIcon>
            <HugeiconsIcon icon={Edit02Icon} size={20} strokeWidth={1.75} />
          </DropdownMenuItemIcon>
          <DropdownMenuItemContent title="Editar" description="Alterar dados do leiloeiro" />
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
                ? "Oculta o leiloeiro de novos vínculos"
                : "Restaura o leiloeiro para uso"
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
          <DropdownMenuItemContent tone="danger" title="Excluir" description="Remove o registro após confirmação" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LeiloeirosTable({
  rows,
  onDetalhes,
  onEditar,
  onToggleAtivo,
  onExcluir,
}: LeiloeirosTableProps) {
  const columns: DataTableColumn<LeiloeiroRow>[] = [
    {
      id: "nome",
      header: "Leiloeiro",
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
      cell: (row) => (
        <Badge variant={row.ativo ? "emerald" : "zinc"} size="sm" className="normal-case tracking-normal">
          {row.ativo ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      id: "registro",
      header: "Registro",
      cellClassName: "whitespace-nowrap text-zinc-700",
      cell: (row) => row.registro,
    },
    {
      id: "documento",
      header: "Documento",
      cellClassName: "whitespace-nowrap text-zinc-600 tabular-nums",
      cell: (row) => formatCpfOuCnpjExibicao(row.documento),
    },
    {
      id: "email",
      header: "E-mail",
      cellClassName: "max-w-[200px] truncate text-zinc-600",
      cell: (row) => row.email,
    },
    {
      id: "telefone",
      header: "Telefone",
      cellClassName: "whitespace-nowrap text-zinc-600",
      cell: (row) => row.telefone,
    },
    {
      id: "local",
      header: "Local",
      cellClassName: "max-w-[140px] truncate text-zinc-600",
      cell: (row) => row.localPrincipal,
    },
    {
      id: "leiloes",
      header: "Leilões",
      align: "center",
      cellClassName: "font-semibold text-zinc-900",
      cell: (row) => row.leiloesVinculados,
    },
    {
      id: "acoes",
      header: <span className="sr-only">Ações</span>,
      align: "right",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => (
        <LeiloeiroRowActionsMenu
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
    getRowId: (r: LeiloeiroRow) => r.id,
    getRowClassName: (row: LeiloeiroRow) =>
      row.ativo ? undefined : ("opacity-[0.78] bg-zinc-50/40" as const),
    minTableWidth: 1020,
    "aria-label": "Tabela de leiloeiros" as const,
    caption: "Leiloeiros cadastrados. Cada linha oferece um menu de ações.",
    emptyTitle: "Nenhum leiloeiro cadastrado",
    emptyDescription:
      "Quando houver leiloeiros, eles aparecerão aqui com dados de contato e ações de gestão.",
  };

  if (rows.length === 0) {
    return <DataTable {...tableProps} />;
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 md:hidden" role="list" aria-label="Lista de leiloeiros">
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
                  <div className="mt-2">
                    <Badge variant={row.ativo ? "emerald" : "zinc"} size="sm" className="normal-case tracking-normal">
                      {row.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
                <LeiloeiroRowActionsMenu
                  row={row}
                  onDetalhes={onDetalhes}
                  onEditar={onEditar}
                  onToggleAtivo={onToggleAtivo}
                  onExcluir={onExcluir}
                />
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="min-w-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    Registro
                  </dt>
                  <dd className="mt-0.5 whitespace-nowrap text-zinc-700">{row.registro}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    Documento
                  </dt>
                  <dd className="mt-0.5 break-all text-zinc-700 tabular-nums">
                    {formatCpfOuCnpjExibicao(row.documento)}
                  </dd>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    E-mail
                  </dt>
                  <dd className="mt-0.5 break-all text-zinc-700">{row.email}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    Telefone
                  </dt>
                  <dd className="mt-0.5 text-zinc-700">{row.telefone}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                    Local
                  </dt>
                  <dd className="mt-0.5 break-words text-zinc-700">{row.localPrincipal}</dd>
                </div>
              </dl>
              <div className="mt-4 rounded-2xl bg-zinc-50/90 px-4 py-3 ring-1 ring-zinc-100">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  Leilões vinculados
                </p>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums text-zinc-900">
                  {row.leiloesVinculados}
                </p>
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
