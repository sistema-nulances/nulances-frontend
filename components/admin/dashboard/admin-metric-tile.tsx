"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/cn";

const accentMap = {
  purple: "border-[var(--nulance-purple)]/20 bg-[var(--nulance-purple)]/10 text-[var(--nulance-purple)]",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  zinc: "border-zinc-200 bg-zinc-50 text-zinc-700",
} as const;

export type AdminMetricTileAccent = keyof typeof accentMap;

type AdminMetricTileProps = {
  label: string;
  value: string | number;
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  accent?: AdminMetricTileAccent;
  hint?: string;
};

export function AdminMetricTile({
  label,
  value,
  icon,
  accent = "purple",
  hint,
}: AdminMetricTileProps) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-zinc-500">{label}</p>
          <p className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-zinc-950">{value}</p>
          {hint ? <p className="mt-1.5 text-[12px] text-zinc-500">{hint}</p> : null}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
            accentMap[accent],
          )}
        >
          <HugeiconsIcon icon={icon} size={22} color="currentColor" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}
