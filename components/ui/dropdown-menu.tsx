"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";

type DropdownMenuContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  rootRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const DropdownMenuContext =
  React.createContext<DropdownMenuContextType | null>(null);

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);

  if (!context) {
    throw new Error("DropdownMenu components must be used inside <DropdownMenu />");
  }

  return context;
}

export function DropdownMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider
      value={{ open, setOpen, rootRef, triggerRef, contentRef }}
    >
      <div ref={rootRef} className="relative inline-flex">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open, setOpen, triggerRef } = useDropdownMenuContext();

  return (
    <div
      ref={triggerRef}
      aria-expanded={open}
      aria-haspopup="menu"
      className={cn("inline-flex", className)}
      onClick={() => setOpen((prev) => !prev)}
    >
      {children}
    </div>
  );
}

export function DropdownMenuContent({
  className,
  children,
  align = "start",
}: {
  className?: string;
  children: React.ReactNode;
  align?: "start" | "end";
}) {
  const { open, contentRef, triggerRef } = useDropdownMenuContext();
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    const menu = contentRef.current;
    if (!trigger || !menu) return;
    const tr = trigger.getBoundingClientRect();
    const mw = menu.offsetWidth;
    const mh = menu.offsetHeight;
    const gap = 12;
    let left = align === "end" ? tr.right - mw : tr.left;
    let top = tr.bottom + gap;
    if (top + mh > window.innerHeight - 12) {
      top = Math.max(12, tr.top - mh - gap);
    }
    left = Math.min(Math.max(8, left), Math.max(8, window.innerWidth - mw - 8));
    setCoords({ top, left });
  }, [align, triggerRef, contentRef]);

  React.useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const r1 = requestAnimationFrame(() => {
      requestAnimationFrame(updatePosition);
    });
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      cancelAnimationFrame(r1);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  const setMenuRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [contentRef]
  );

  if (!open || !mounted) return null;

  return createPortal(
    <motion.div
      ref={setMenuRef}
      role="menu"
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        zIndex: 99999,
      }}
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "min-w-[280px] overflow-hidden rounded-[22px] border border-black/8 bg-white/95 p-2 shadow-lg shadow-black/10 backdrop-blur-xl",
        className
      )}
    >
      {children}
    </motion.div>,
    document.body
  );
}

export function DropdownMenuLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "px-3.5 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  inset,
  children,
  onClick,
}: {
  className?: string;
  inset?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const { setOpen } = useDropdownMenuContext();

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      className={cn(
        "group flex w-full items-center gap-3 rounded-[16px] px-3.5 py-3 text-left transition-all duration-200",
        "text-zinc-700 hover:bg-zinc-100/90 hover:text-zinc-950",
        "focus:outline-none focus:ring-2 focus:ring-black/5",
        inset && "pl-9",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuItemIcon({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/6 bg-zinc-50 text-zinc-700 transition-colors group-hover:bg-white",
        className
      )}
    >
      {children}
    </span>
  );
}

export function DropdownMenuItemContent({
  title,
  description,
  shortcut,
  tone = "default",
}: {
  title: string;
  description?: string;
  shortcut?: string;
  tone?: "default" | "danger" | "success";
}) {
  const titleTone =
    tone === "danger"
      ? "text-red-800 group-hover:text-red-900"
      : tone === "success"
        ? "text-emerald-800 group-hover:text-emerald-900"
        : "text-zinc-900 group-hover:text-zinc-950";
  const descTone =
    tone === "danger"
      ? "text-red-600/90 group-hover:text-red-700"
      : tone === "success"
        ? "text-emerald-600/90 group-hover:text-emerald-700"
        : "text-zinc-500 group-hover:text-zinc-600";

  return (
    <span className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3">
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate text-[15px] font-semibold tracking-[-0.01em]",
            titleTone
          )}
        >
          {title}
        </span>
        {description ? (
          <span className={cn("mt-0.5 block truncate text-[12px] font-medium", descTone)}>
            {description}
          </span>
        ) : null}
      </span>

      {shortcut ? (
        <Badge variant="light" className="px-2.5 py-1 tracking-[0.08em]">
          {shortcut}
        </Badge>
      ) : null}
    </span>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-2 h-px bg-zinc-200/80" />;
}
