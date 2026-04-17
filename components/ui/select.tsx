"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";

export type SelectOption = { value: string; label: string };

export interface SelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  "aria-label"?: string;
  /** `flat`: sem sombra no gatilho (ex.: sheets). */
  variant?: "default" | "flat";
  /** Quando true, exibe campo de busca no dropdown. */
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsLabel?: string;
}

export function Select({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Selecione…",
  disabled,
  error,
  className,
  ["aria-label"]: ariaLabel,
  variant = "default",
  searchable = false,
  searchPlaceholder = "Pesquisar...",
  noResultsLabel = "Nenhum resultado encontrado.",
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filteredOptions = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, search]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      const t = event.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (contentRef.current?.contains(t)) return;
      setOpen(false);
      setSearch("");
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    const panel = contentRef.current;
    if (!trigger) return;
    const tr = trigger.getBoundingClientRect();
    const mw = panel?.offsetWidth ?? tr.width;
    const mh = panel?.offsetHeight ?? 0;
    let left = tr.left;
    let top = tr.bottom + 8;
    if (mh > 0 && top + mh > window.innerHeight - 12) {
      top = Math.max(12, tr.top - mh - 8);
    }
    left = Math.min(Math.max(8, left), Math.max(8, window.innerWidth - mw - 8));
    setCoords({ top, left, width: tr.width });
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const r1 = requestAnimationFrame(() => requestAnimationFrame(updatePosition));
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      cancelAnimationFrame(r1);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, options.length, updatePosition]);

  React.useEffect(() => {
    if (!open || !searchable) return;
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, searchable]);

  const setPanelRef = React.useCallback((node: HTMLDivElement | null) => {
    (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, []);

  const listId = `${id ?? "select"}-listbox`;

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-2xl border bg-white px-3 text-left text-sm font-medium transition-all",
          variant === "default" && "shadow-sm shadow-black/[0.03]",
          variant === "flat" && "shadow-none",
          error
            ? "border-red-400 focus-visible:ring-4 focus-visible:ring-red-100"
            : open
              ? variant === "flat"
                ? "border-[var(--nulance-purple)] ring-2 ring-[var(--ring)]"
                : "border-[var(--nulance-purple)] ring-4 ring-[var(--ring)]"
              : variant === "flat"
                ? "border-zinc-200 hover:border-zinc-300 focus-visible:border-[var(--nulance-purple)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                : "border-zinc-200 hover:border-zinc-300 focus-visible:border-[var(--nulance-purple)] focus-visible:ring-4 focus-visible:ring-[var(--ring)]",
          disabled && "pointer-events-none cursor-not-allowed opacity-50"
        )}
      >
        <span className={cn("min-w-0 truncate", !selected && "font-normal text-zinc-400")}>
          {selected?.label ?? placeholder}
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--nulance-purple)]/10 text-[var(--nulance-purple)]">
          <ChevronDownIcon
            className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
            aria-hidden
          />
        </span>
      </button>

      {mounted &&
        open &&
        createPortal(
          <motion.div
            ref={setPanelRef}
            id={listId}
            role="listbox"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width > 0 ? coords.width : undefined,
              minWidth: coords.width > 0 ? coords.width : 220,
              zIndex: 100000,
            }}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-1.5",
              "shadow-xl shadow-black/12 ring-1 ring-black/[0.04]"
            )}
          >
            {searchable ? (
              <div className="px-1 pb-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-9 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition-colors focus:border-[var(--nulance-purple)] focus:bg-white focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
            ) : null}
            <ul className="max-h-[min(280px,50vh)] overflow-y-auto custom-scrollbar py-0.5">
              {filteredOptions.map((opt) => {
                const isOn = opt.value === value;
                return (
                  <li key={opt.value} role="presentation">
                    <button
                      id={`${id ?? "sel"}-opt-${opt.value}`}
                      type="button"
                      role="option"
                      aria-selected={isOn}
                      onClick={() => {
                        onValueChange(opt.value);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={cn(
                        "flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                        isOn
                          ? "bg-[var(--nulance-purple)]/12 text-[var(--nulance-purple)]"
                          : "text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950"
                      )}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })}
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-zinc-500">{noResultsLabel}</li>
              ) : null}
            </ul>
          </motion.div>,
          document.body
        )}
    </div>
  );
}
