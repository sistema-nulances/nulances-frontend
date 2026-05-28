"use client";

import { usePathname } from "next/navigation";
import { ArrowLeft01Icon, PackageIcon, ShoppingBag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { Logo } from "@/components/ui/logo";
import { AdminSidebarLink } from "@/components/admin/sidebar/admin-sidebar-link";

type SellerNavItem = {
  href: string;
  label: string;
  icon: React.ComponentProps<typeof AdminSidebarLink>["icon"];
};

const SELLER_ITEMS: SellerNavItem[] = [
  { href: "/painel-vendedor/meus-anuncios", label: "Meus Anúncios", icon: ShoppingBag01Icon },
  { href: "/painel-vendedor/planos", label: "Planos", icon: PackageIcon },
];

export function SellerSidebar() {
  const pathname = usePathname() ?? "";
  const active = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <aside className="flex h-full w-[230px] min-w-[230px] max-w-[230px] shrink-0 flex-col overflow-hidden border-r border-zinc-200 bg-white">
      <div className="shrink-0 px-6 pb-3 pt-2">
        <div className="flex flex-col items-center justify-center gap-2">
          <Logo variant="marketplace" size={120} className="h-auto w-auto object-contain" priority />
        </div>
      </div>

      <nav className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-0 pb-4">
        <div className="space-y-1 pr-1">
          {SELLER_ITEMS.map((item) => (
            <AdminSidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={active(item.href)}
            />
          ))}
        </div>
      </nav>

      <div className="shrink-0 px-3 pb-3">
        <Link
          href="/marketplace"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color="currentColor" strokeWidth={1.8} />
          Sair do painel
        </Link>
      </div>
    </aside>
  );
}
