"use client";

import * as React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/cn";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  children: React.ReactNode;
}

type SheetContextType = {
  open: boolean;
  onClose?: () => void;
  side: "left" | "right";
};

const SheetContext = React.createContext<SheetContextType | null>(null);

function useSheetContext() {
  const context = React.useContext(SheetContext);
  if (!context) {
    throw new Error("Sheet components must be used inside <Sheet />");
  }
  return context;
}

export function Sheet({
  open,
  onClose,
  side = "right",
  children,
}: SheetProps) {
  const [mounted, setMounted] = React.useState(false);
  const [isRendered, setIsRendered] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setIsRendered(true);
      // Pega a largura do scrollbar para não pular a tela
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = "hidden";
      
      // Delay to ensure the DOM is ready for the animation
      let raf2: number;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setMounted(true);
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }

    setMounted(false);
    const timeout = setTimeout(() => {
      setIsRendered(false);
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    }, 300);

    return () => clearTimeout(timeout);
  }, [open]);

  React.useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

  React.useEffect(() => {
    return () => {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    };
  }, []);

  if (!isRendered) return null;

  return (
    <SheetContext.Provider value={{ open: mounted, onClose, side }}>
      <div className="fixed inset-0 z-50">
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className={cn(
            "absolute inset-0 bg-black/30 transition-opacity duration-300 ease-in-out",
            mounted ? "opacity-100" : "opacity-0"
          )}
        />

        {children}
      </div>
    </SheetContext.Provider>
  );
}

export function SheetContent({
  className,
  children,
  onClose,
  bodyClassName,
  hideCloseButton,
}: {
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
  /** Classes da área rolável (conteúdo principal). */
  bodyClassName?: string;
  hideCloseButton?: boolean;
}) {
  const { open, side, onClose: contextOnClose } = useSheetContext();
  const handleClose = onClose ?? contextOnClose;

  return (
    <div
      className={cn(
        "absolute top-0 h-full w-full max-w-[360px] bg-white (0,0,0,0.18)] transition-transform duration-300 ease-in-out",
        side === "left"
          ? cn(
              "left-0 border-r border-zinc-200 rounded-r-[28px]",
              open ? "translate-x-0" : "-translate-x-full"
            )
          : cn(
              "right-0 border-l border-zinc-200 rounded-l-[28px]",
              open ? "translate-x-0" : "translate-x-full"
            ),
        className
      )}
    >
      <div className="flex h-full min-h-0 flex-col">
        {!hideCloseButton ? (
          <div className="flex shrink-0 items-center justify-end px-4 pt-4">
            {handleClose && (
              <button
                type="button"
                onClick={handleClose}
                aria-label="Fechar"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : null}

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-4 pb-5",
            hideCloseButton && "pt-4",
            bodyClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 px-2", className)} {...props} />;
}

export function SheetTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold tracking-tight text-zinc-900", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("mt-1 text-sm text-zinc-500", className)} {...props} />
  );
}

export function SheetSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("my-3 h-px bg-zinc-200", className)} {...props} />;
}
