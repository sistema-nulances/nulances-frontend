"use client";

import { PackageIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { resolveBemMarcaIconFromMarca } from "@/lib/bem-marca-icon";
import { cn } from "@/lib/cn";

type BemMarcaLogoProps = {
  nome: string;
  marca?: string | null;
  className?: string;
  /** Padrão `md` (admin); `sm` para cards compactos (home leilões). */
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASSES = {
  sm: "h-8 w-8 sm:h-9 sm:w-9",
  md: "h-12 w-12 sm:h-14 sm:w-14",
  lg: "h-14 w-14 sm:h-16 sm:w-16",
} as const;

export function BemMarcaLogo({ nome, marca: marcaField, className, size = "md" }: BemMarcaLogoProps) {
  const marca = resolveBemMarcaIconFromMarca(marcaField, nome);
  const box = SIZE_CLASSES[size];

  if (!marca) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center text-[var(--nulance-purple)]",
          className
        )}
      >
        <HugeiconsIcon icon={PackageIcon} className={box} aria-hidden />
      </span>
    );
  }

  return (
    <span
      className={cn("flex shrink-0 items-center justify-center", className)}
      title={marca.title}
    >
      <svg
        role="img"
        viewBox="0 0 24 24"
        className={box}
        aria-hidden
      >
        <title>{marca.title}</title>
        <path d={marca.path} fill={`#${marca.hex}`} />
      </svg>
    </span>
  );
}
