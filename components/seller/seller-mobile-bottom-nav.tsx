"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, PackageIcon, ShoppingBag01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/cn";

const items = [
  {
    href: "/painel-vendedor/meus-anuncios",
    label: "Meus anúncios",
    icon: ShoppingBag01Icon,
    match: (p: string) => p === "/painel-vendedor" || p.startsWith("/painel-vendedor/meus-anuncios"),
  },
  {
    href: "/painel-vendedor/planos",
    label: "Planos",
    icon: PackageIcon,
    match: (p: string) => p.startsWith("/painel-vendedor/planos"),
  },
  {
    href: "/marketplace",
    label: "Marketplace",
    icon: ArrowLeft01Icon,
    match: (p: string) => p.startsWith("/marketplace"),
  },
] as const;

export function SellerMobileBottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur-md md:hidden"
      aria-label="Navegação do painel vendedor"
    >
      <div className="mx-auto flex h-16 max-w-full items-stretch gap-1 overflow-x-auto px-2 pb-[env(safe-area-inset-bottom)] pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ href, label, icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[112px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1 text-[11px] font-semibold transition-colors",
                active ? "text-[var(--nulance-purple)]" : "text-zinc-500 hover:text-zinc-800"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                  active ? "bg-[var(--nulance-purple)]/10" : "bg-transparent"
                )}
              >
                <HugeiconsIcon
                  icon={icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={active ? 2 : 1.7}
                  className={cn(active ? "text-[var(--nulance-purple)]" : "text-zinc-500")}
                />
              </span>
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

