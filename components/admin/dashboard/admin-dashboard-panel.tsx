import * as React from "react";
import { cn } from "@/lib/cn";

type AdminDashboardPanelProps = {
  title: string;
  subtitle?: string;
  className?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
};

export function AdminDashboardPanel({
  title,
  subtitle,
  className,
  headerAction,
  children,
}: AdminDashboardPanelProps) {
  return (
    <section
      className={cn("rounded-3xl bg-white p-6 ring-1 ring-zinc-200 sm:p-8", className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-zinc-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
        </div>
        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
