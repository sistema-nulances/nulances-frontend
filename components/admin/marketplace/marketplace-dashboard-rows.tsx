"use client";

import type { ComponentProps } from "react";

import { VendedorAdminLink } from "@/components/admin/marketplace/vendedor-admin-link";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceActivityEvent } from "@/data/marketplace-admin-mock";
import { labelTipoVeiculoApi } from "@/data/bem-veiculo-api";
import { formatDashboardDateTime } from "@/lib/format-dashboard-datetime";
import type { AnuncioModerarListResponse } from "@/lib/repositories/types/admin-anuncios.types";
import { cn } from "@/lib/cn";

export function ModerationQueueRow({ item }: { item: AnuncioModerarListResponse }) {
  const enviadoEm = item.enviadoEm ?? "";
  const tipoLabel = labelTipoVeiculoApi(item.tipoVeiculo) || String(item.tipoVeiculo ?? "").trim() || "—";

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0",
        "sm:flex-row sm:items-start sm:justify-between sm:gap-4"
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-zinc-900">{item.modelo}</p>
        <p className="mt-1 text-[12px] text-zinc-500">
          <VendedorAdminLink name={item.nomeVendedor} className="text-[12px]" /> · #{item.id}
        </p>
        <p className="mt-1 text-[12px] text-zinc-600">
          Enviado em{" "}
          <time dateTime={enviadoEm} className="font-medium text-zinc-800">
            {enviadoEm ? formatDashboardDateTime(enviadoEm) : "—"}
          </time>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="amber" size="sm" className="normal-case">
          {tipoLabel}
        </Badge>
      </div>
    </div>
  );
}

function activityBadgeVariant(
  tipo: MarketplaceActivityEvent["tipo"]
): ComponentProps<typeof Badge>["variant"] {
  if (tipo === "novo") return "emerald";
  if (tipo === "edicao") return "purple";
  if (tipo === "encerrado") return "zinc";
  return "red";
}

function activityLabel(tipo: MarketplaceActivityEvent["tipo"]): string {
  if (tipo === "novo") return "Novo anúncio";
  if (tipo === "edicao") return "Edição";
  if (tipo === "encerrado") return "Encerrado";
  return "Suspenso";
}

export function ActivityFeedRow({ event }: { event: MarketplaceActivityEvent }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0",
        "sm:flex-row sm:items-start sm:justify-between sm:gap-4"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={activityBadgeVariant(event.tipo)} size="sm" className="normal-case tracking-normal">
            {activityLabel(event.tipo)}
          </Badge>
          <span className="text-[12px] text-zinc-500">
            Anúncio #{event.anuncioId}
          </span>
        </div>
        <p className="mt-2 text-[14px] font-semibold text-zinc-900">{event.titulo}</p>
        {event.detalhe ? <p className="mt-1 text-[12px] text-zinc-600">{event.detalhe}</p> : null}
      </div>
      <time
        dateTime={event.ocorreuEm}
        className="shrink-0 text-[12px] font-medium tabular-nums text-zinc-500 sm:text-right"
      >
        {formatDashboardDateTime(event.ocorreuEm)}
      </time>
    </div>
  );
}
