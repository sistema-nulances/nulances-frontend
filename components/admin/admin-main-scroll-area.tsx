"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

/**
 * Área rolável do admin: em telas de banners o conteúdo costuma ser mais curto e o
 * padding-bottom do `main` vira “área branca” extra ao rolar até o fim.
 */
export function AdminMainScrollArea({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isBannersRoute =
    pathname === "/admin/banners" ||
    pathname.startsWith("/admin/banners/") ||
    pathname === "/admin/marketplace/banners" ||
    pathname.startsWith("/admin/marketplace/banners/");

  return (
    <main
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-6 sm:px-6 lg:px-8 lg:pt-8",
        isBannersRoute ? "pb-6 md:pb-0" : "pb-6 md:pb-4"
      )}
    >
      {children}
    </main>
  );
}
