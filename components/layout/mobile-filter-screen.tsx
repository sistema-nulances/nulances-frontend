"use client";

import * as React from "react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/cn";

type MobileFilterScreenProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  className?: string;
};

/**
 * Tela cheia de filtros no mobile (estilo app), sem painel lateral.
 */
export function MobileFilterScreen({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: MobileFilterScreenProps) {
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col bg-white md:hidden",
        "pt-[env(safe-area-inset-top)]",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-filter-title"
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-zinc-100 px-3 py-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100"
          aria-label="Fechar filtros"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color="currentColor" strokeWidth={1.9} />
        </button>
        <div className="min-w-0 flex-1">
          <h2 id="mobile-filter-title" className="text-lg font-bold leading-tight text-zinc-900">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-width:thin]">
        {children}
      </div>

      <div
        className="shrink-0 border-t border-zinc-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        {footer}
      </div>
    </div>
  );
}
