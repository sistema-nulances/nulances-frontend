"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  AuctionIcon,
  Home09Icon,
  ShoppingBag01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/cn";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"];
  match: (pathname: string) => boolean;
};

const LEILAO_ITEMS: Item[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home09Icon, match: (p) => p === "/admin/dashboard" || p === "/admin" },
  { href: "/admin/leiloes", label: "Leilões", icon: AuctionIcon, match: (p) => p.startsWith("/admin/leiloes") },
  { href: "/admin/lotes", label: "Lotes", icon: ShoppingBag01Icon, match: (p) => p.startsWith("/admin/lotes") || p.startsWith("/admin/bens-itens") },
  { href: "/admin/comitentes", label: "Pessoas", icon: UserMultipleIcon, match: (p) => p.startsWith("/admin/comitentes") || p.startsWith("/admin/leiloeiros") },
  { href: "/admin/avisos", label: "Gestão de usuários", icon: Alert02Icon, match: (p) => p.startsWith("/admin/avisos") || p.startsWith("/admin/banners") || p.startsWith("/admin/documentos") },
];

const MARKETPLACE_ITEMS: Item[] = [
  { href: "/admin/marketplace/dashboard", label: "Dashboard", icon: Home09Icon, match: (p) => p === "/admin/marketplace/dashboard" || p === "/admin/marketplace" },
  { href: "/admin/marketplace/anuncios", label: "Anúncios", icon: ShoppingBag01Icon, match: (p) => p.startsWith("/admin/marketplace/anuncios") },
  { href: "/admin/marketplace/vendedores", label: "Vendedores", icon: UserMultipleIcon, match: (p) => p.startsWith("/admin/marketplace/vendedores") },
  { href: "/admin/marketplace/avisos", label: "Gestão de usuários", icon: Alert02Icon, match: (p) => p.startsWith("/admin/marketplace/avisos") || p.startsWith("/admin/marketplace/banners") },
  { href: "/admin/marketplace/dashboard", label: "Leilão", icon: AuctionIcon, match: () => false },
];

export function AdminMobileBottomNav() {
  const pathname = usePathname() ?? "";
  const isMarketplace = pathname.startsWith("/admin/marketplace");
  const items = isMarketplace ? MARKETPLACE_ITEMS : LEILAO_ITEMS;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 backdrop-blur-md md:hidden"
      aria-label="Navegação do painel admin"
    >
      <div className="mx-auto flex h-16 max-w-full items-stretch gap-1 overflow-x-auto px-2 pb-[env(safe-area-inset-bottom)] pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map(({ href, label, icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={`${href}-${label}`}
              href={href}
              className={cn(
                "flex min-w-[86px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1 text-[11px] font-semibold transition-colors",
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

