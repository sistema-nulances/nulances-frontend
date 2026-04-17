"use client";

import { PackageIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { LoteAdmin, LoteAdminStatus } from "@/data/lotes-admin";
import { lotePodeVincularLeilao } from "@/data/lotes-admin";
import { leilaoTituloParaLote } from "@/lib/admin-lotes";
import { cn } from "@/lib/cn";

type LoteDetailSheetProps = {
  open: boolean;
  onClose: () => void;
  lote: LoteAdmin | null;
};

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

export function LoteDetailSheet({ open, onClose, lote }: LoteDetailSheetProps) {
  const router = useRouter();
  const leilaoNome = lote ? leilaoTituloParaLote(lote.leilaoId) : null;
  const podeVincular = lote ? lotePodeVincularLeilao(lote) : false;

  const irParaBens = () => {
    if (!lote) return;
    try {
      sessionStorage.setItem(
        "nulance-admin-lote-context",
        JSON.stringify({
          id: lote.id,
          codigo: lote.codigo,
          titulo: lote.titulo,
          itemIds: lote.itens.map((i) => i.id),
        })
      );
    } catch {
      /* ignore */
    }
    router.push(`/admin/bens-itens?lote=${encodeURIComponent(lote.id)}`);
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} side="right">
      <SheetContent className="max-w-[min(100vw-1rem,560px)] !w-full" onClose={onClose}>
        <SheetHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <SheetTitle>{lote ? lote.codigo : "Lote"}</SheetTitle>
            {lote ? statusBadge(lote.status) : null}
          </div>
          <SheetDescription className="text-left">
            {lote ? (
              <span className="text-zinc-700">{lote.titulo}</span>
            ) : (
              "Selecione um lote na lista."
            )}
          </SheetDescription>
        </SheetHeader>

        {lote ? (
          <div className="mt-6 flex flex-col gap-6 pb-2">
            {!podeVincular ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50/95 px-4 py-3 text-sm text-amber-950">
                Este lote já foi utilizado em um leilão e{" "}
                <strong className="font-semibold">não pode ser adicionado novamente</strong> a outro
                evento.
              </p>
            ) : (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950">
                Lote <strong className="font-semibold">disponível</strong> para vinculação a um único
                leilão.
              </p>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-600">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400">
                Leilão vinculado
              </p>
              <p className="mt-1 font-medium text-zinc-900">
                {leilaoNome ?? (
                  <span className="text-zinc-500">Nenhum — lote ainda não alocado a um evento.</span>
                )}
              </p>
            </div>

            {lote.observacoes ? (
              <p className="text-sm text-zinc-600">
                <span className="font-semibold text-zinc-800">Observações: </span>
                {lote.observacoes}
              </p>
            ) : null}

            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                    Bens que compõem este lote
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    {lote.itens.length} {lote.itens.length === 1 ? "item" : "itens"} catalogado
                    {lote.itens.length === 1 ? "" : "s"}.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full"
                  onClick={irParaBens}
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
                  Visualizar
                </Button>
              </div>

              <ul className="mt-4 flex flex-col gap-3">
                {lote.itens.map((bem) => (
                  <li
                    key={bem.id}
                    className={cn(
                      "rounded-[18px] border border-zinc-200/90 bg-white p-4",
                      "transition-colors hover:border-[var(--nulance-purple)]/35"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--nulance-purple)]/10 text-[var(--nulance-purple)]">
                        <HugeiconsIcon icon={PackageIcon} className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-snug text-zinc-900">{bem.nome}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {bem.categoria ?? bem.tipoVeiculo ? (
                            <Badge variant="zinc" size="sm" className="normal-case tracking-normal">
                              {bem.categoria ?? bem.tipoVeiculo}
                            </Badge>
                          ) : null}
                          <span className="font-mono text-[11px] text-zinc-400">ID {bem.id}</span>
                        </div>
                        {bem.descricao ? (
                          <p className="mt-2 text-sm leading-relaxed text-zinc-600">{bem.descricao}</p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
