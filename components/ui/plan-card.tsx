"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type PlanCardData = {
  id: string;
  nome: string;
  descricao: string;
  precoMensal: number;
  limiteAnuncios: number;
  destaque?: boolean;
};

type PlanCardProps = {
  plano: PlanCardData;
  active?: boolean;
  className?: string;
  footer?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  actionLoading?: boolean;
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function PlanCard({
  plano,
  active = false,
  className,
  footer,
  actionLabel,
  onAction,
  actionDisabled,
  actionLoading,
}: PlanCardProps) {
  return (
    <article
      className={cn(
        "rounded-3xl bg-white p-6 ring-1 ring-zinc-200",
        active ? "ring-[var(--nulance-purple)]/45" : "",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[20px] font-bold tracking-[-0.02em] text-zinc-900">{plano.nome}</p>
          <p className="mt-1 text-sm text-zinc-500">{plano.descricao}</p>
        </div>
        {plano.destaque ? (
          <Badge variant="purple" size="sm" className="normal-case">
            Recomendado
          </Badge>
        ) : null}
      </div>

      <p className="mt-5 text-[30px] font-bold tracking-[-0.03em] text-zinc-950">
        {formatMoney(plano.precoMensal)}
        <span className="ml-1 text-sm font-medium text-zinc-500">/mês</span>
      </p>

      <p className="mt-2 text-sm text-zinc-700">
        Até <strong>{plano.limiteAnuncios} anúncios</strong> ativos por ciclo.
      </p>

      {footer ? <div className="mt-4">{footer}</div> : null}

      {actionLabel ? (
        <Button
          type="button"
          className="mt-5 rounded-full"
          variant={active ? "secondary" : "default"}
          onClick={onAction}
          disabled={actionDisabled}
          loading={actionLoading}
        >
          {actionLabel}
        </Button>
      ) : null}
    </article>
  );
}
