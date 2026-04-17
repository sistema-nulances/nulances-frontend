"use client";

import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import type { AuctionItem, AuctionStatus } from "@/data/auction-items";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/utils/status-auction";
import { cn } from "@/lib/cn";

function statusBadgeVariant(status: AuctionItem["status"]): ComponentProps<typeof Badge>["variant"] {
  if (status === "ABERTO") return "emerald";
  if (status === "EM_BREVE") return "amber";
  return "zinc";
}

export type AuctionLiveRowItem = {
  titulo: string;
  lote: string;
  local: string;
  dataEncerramento: string;
  status: AuctionStatus;
  lanceAtual?: string;
  lanceInicial?: string;
};

export function AuctionLiveRow({ item }: { item: AuctionLiveRowItem }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0",
        "sm:flex-row sm:items-center sm:justify-between",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-zinc-900">{item.titulo}</p>
        <p className="mt-1 text-[12px] text-zinc-500">
          {item.lote} · {item.local}
        </p>
        <p className="mt-1 text-[12px] text-zinc-600">
          Encerra: <span className="font-medium text-zinc-800">{item.dataEncerramento}</span>
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        <Badge variant={statusBadgeVariant(item.status)} size="sm">
          {getStatusLabel(item.status)}
        </Badge>
        <p className="text-[13px] font-semibold text-zinc-900">
          {item.lanceAtual ?? item.lanceInicial}
        </p>
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          {item.lanceAtual ? "Lance atual" : "Lance inicial"}
        </span>
      </div>
    </div>
  );
}

export function AuctionUpcomingRow({ item }: { item: AuctionItem }) {
  return (
    <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-zinc-900">{item.titulo}</p>
        <p className="mt-1 text-[12px] text-zinc-500">
          {item.lote} · {item.local}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1 sm:items-end">
        <Badge variant="amber" size="sm">
          {getStatusLabel(item.status)}
        </Badge>
        <p className="text-[12px] text-zinc-600">
          Abertura: <span className="font-medium text-zinc-800">{item.dataAbertura}</span>
        </p>
        <p className="text-[12px] font-semibold text-zinc-700">{item.lanceInicial}</p>
      </div>
    </div>
  );
}

export function AuctionClosingTodayRow({ item }: { item: AuctionItem }) {
  return (
    <div className="flex flex-col gap-1 border-t border-zinc-100 pt-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-zinc-900">{item.titulo}</p>
        <p className="text-[11px] text-zinc-500">{item.lote}</p>
      </div>
      <p className="shrink-0 text-[12px] font-medium text-zinc-700">{item.dataEncerramento}</p>
    </div>
  );
}

export function AdminDashboardTextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[14px] font-semibold text-[var(--nulance-purple)] transition hover:underline"
    >
      {children}
    </Link>
  );
}
