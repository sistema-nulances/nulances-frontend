import * as React from "react";

import { cn } from "@/lib/cn";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Bloco de placeholder com animação de pulso. Use para estados de carregamento
 * de página, listas e cartões — não substitui o spinner em botões de envio.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-zinc-200/90", className)}
      {...props}
    />
  );
}
