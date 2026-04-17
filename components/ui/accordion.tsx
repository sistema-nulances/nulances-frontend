"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/cn";

export interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return <div className={className}>{children}</div>;
}

export interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** `plain`: sem caixa nem borda (lista simples, alinhado ao design system “superfícies soltas”). */
  variant?: "default" | "plain";
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  variant = "default",
}: AccordionItemProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  const isPlain = variant === "plain";

  return (
    <div
      className={cn(
        !isPlain && "mb-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white",
        isPlain && "border-b border-zinc-100 last:border-b-0",
      )}
    >
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between text-left font-semibold text-zinc-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
          !isPlain && "px-6 py-4 text-lg hover:bg-zinc-50",
          isPlain && "gap-3 py-3.5 pl-0 pr-1 text-[15px] tracking-[-0.01em] hover:text-nulance-purple",
        )}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">{title}</div>

        <HugeiconsIcon
          icon={ArrowRight01Icon}
          size={isPlain ? 18 : 20}
          className={`shrink-0 text-zinc-400 transition-transform duration-200 ${
            open ? "rotate-90" : "rotate-0"
          } ${isPlain ? "" : "ml-4 text-zinc-500"}`}
        />
      </button>

      {open && (
        <div className={cn(!isPlain && "bg-white px-6 py-4", isPlain && "pb-5 pt-0")}>
          {children}
        </div>
      )}
    </div>
  );
}