"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import {
  ArrowRight01Icon,
  Calendar03Icon,
  Clock01Icon,
  LegalHammerIcon,
  Location01Icon,
  PackageIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { LeilaoAdmin } from "@/data/leiloes-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusLabel } from "@/utils/status-auction";
import { cn } from "@/lib/cn";

function modalidadeLabel(leilao: LeilaoAdmin): string {
  if (leilao.modalidade === "online") return "Online";
  return "Presencial";
}

function localExibicao(leilao: LeilaoAdmin): string {
  if (leilao.modalidade === "online") return "Online";
  return leilao.local;
}

function statusBadgeVariant(
  status: LeilaoAdmin["status"]
): ComponentProps<typeof Badge>["variant"] {
  if (status === "ABERTO") return "emerald";
  if (status === "EM_BREVE") return "amber";
  return "zinc";
}

export function LeilaoCard({
  leilao,
  onDelete,
}: {
  leilao: LeilaoAdmin;
  onDelete?: (leilao: LeilaoAdmin) => void;
}) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-[22px] border border-zinc-300 bg-white p-5 transition-colors",
        "hover:border-[var(--nulance-purple)]/45"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-[16px] font-bold leading-snug text-zinc-900">{leilao.titulo}</h2>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-zinc-500">
            <Badge variant="zinc" size="sm" className="font-medium">
              {modalidadeLabel(leilao)}
            </Badge>
            <span className="inline-flex items-start gap-1.5">
              <HugeiconsIcon icon={Location01Icon} className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
              <span>{localExibicao(leilao)}</span>
            </span>
          </p>
        </div>
        <Badge variant={statusBadgeVariant(leilao.status)} size="sm">
          {getStatusLabel(leilao.status)}
        </Badge>
      </div>

      {/* Abertura / encerramento: flex + min-w-0 evita estourar o card; espaçamento compacto */}
      <div className="mt-4 min-w-0 border-t border-zinc-100 pt-4">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-3">
          <div className="flex min-w-0 flex-1 gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--nulance-purple)]/10 text-[var(--nulance-purple)]">
              <HugeiconsIcon icon={Calendar03Icon} className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Abertura</p>
              <p className="mt-0.5 text-[13px] font-semibold leading-snug text-zinc-900">{leilao.dataAbertura}</p>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 gap-2.5 border-t border-zinc-100 pt-4 sm:border-t-0 sm:border-l sm:border-zinc-100 sm:pl-3 sm:pt-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
              <HugeiconsIcon icon={Clock01Icon} className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Encerramento</p>
              <p className="mt-0.5 text-[13px] font-semibold leading-snug text-zinc-900">{leilao.dataEncerramento}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-100 pt-4 text-[13px] text-zinc-600">
        <span className="inline-flex items-center gap-1.5">
          <HugeiconsIcon icon={LegalHammerIcon} className="h-4 w-4 text-zinc-400" />
          <span className="font-medium text-zinc-800">{leilao.leiloeiroNome}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <HugeiconsIcon icon={PackageIcon} className="h-4 w-4 text-zinc-400" />
          <span>
            <strong className="font-semibold text-zinc-900">{leilao.totalLotes}</strong> lotes
            {leilao.status === "ABERTO" && leilao.lotesAoVivo > 0 ? (
              <span className="text-zinc-500">
                {" "}
                · <span className="font-medium text-emerald-700">{leilao.lotesAoVivo} ao vivo</span>
              </span>
            ) : null}
          </span>
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">
        <Link
          href={`/admin/leiloes/${encodeURIComponent(leilao.id)}`}
          className={cn(
            "inline-flex h-8 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-zinc-50 px-3 text-sm font-medium text-zinc-900",
            "outline-none transition-colors hover:border-zinc-400 hover:bg-zinc-100 focus-visible:ring-4 focus-visible:ring-[var(--ring)]"
          )}
        >
          Painel do leilão
          <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
        </Link>
        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-full text-red-700 hover:bg-red-50 hover:text-red-800"
            onClick={() => onDelete(leilao)}
          >
            <TrashIcon className="h-4 w-4" aria-hidden />
            Excluir
          </Button>
        ) : null}
      </div>
    </article>
  );
}
