"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";

type DialogContextType = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
};

const DialogContext = React.createContext<DialogContextType | null>(null);

function useDialogContext() {
  const ctx = React.useContext(DialogContext);
  if (!ctx) {
    throw new Error("Dialog parts must be used inside <Dialog />");
  }
  return ctx;
}

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const [mounted, setMounted] = React.useState(false);
  const [isRendered, setIsRendered] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setIsRendered(true);
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = "hidden";
      const raf = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf);
    }

    setMounted(false);
    const t = setTimeout(() => {
      setIsRendered(false);
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    }, 200);
    return () => clearTimeout(t);
  }, [open]);

  React.useEffect(() => {
    return () => {
      document.body.style.paddingRight = "";
      document.body.style.overflow = "";
    };
  }, []);

  React.useEffect(() => {
    if (!open || !mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, mounted, onOpenChange]);

  if (!isRendered) return null;

  return (
    <DialogContext.Provider value={{ open: mounted, onOpenChange, titleId, descriptionId }}>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <button
          type="button"
          aria-label="Fechar diálogo"
          className={cn(
            "absolute inset-0 bg-black/35 transition-opacity duration-200",
            mounted ? "opacity-100" : "opacity-0"
          )}
          onClick={() => onOpenChange(false)}
        />
        {children}
      </div>
    </DialogContext.Provider>
  );
}

export function DialogContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { open, titleId, descriptionId } = useDialogContext();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn(
        "relative z-10 w-full max-w-md rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-xl shadow-black/8 ring-1 ring-black/5 transition-all duration-200",
        open ? "scale-100 opacity-100" : "scale-[0.98] opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1.5", className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useDialogContext();
  return (
    <h2
      id={titleId}
      className={cn("text-lg font-semibold tracking-tight text-zinc-900", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { descriptionId } = useDialogContext();
  return (
    <div id={descriptionId} className={cn("text-sm leading-relaxed text-zinc-600", className)} {...props} />
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3", className)}
      {...props}
    />
  );
}

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  /** `destructive`=vermelho, `warning`=âmbar. */
  confirmVariant?: "default" | "destructive" | "warning";
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  confirmVariant = "default",
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="w-full rounded-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="default"
            size="md"
            className={cn(
              "w-full rounded-full sm:w-auto",
              confirmVariant === "destructive" &&
                "bg-red-600 text-white hover:opacity-95 focus-visible:ring-red-300",
              confirmVariant === "warning" &&
                "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-300"
            )}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
