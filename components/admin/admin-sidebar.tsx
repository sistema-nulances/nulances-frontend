"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/cn";
import { AdminMiniSidebarLink } from "@/components/admin/sidebar/admin-mini-sidebar-link";
import { AdminMainNav } from "@/components/admin/sidebar/admin-main-nav";
import { AdminExitDialog } from "@/components/admin/sidebar/admin-exit-dialog";
import {
  AuctionIcon,
  Logout01Icon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons";

export type AdminSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [exitDialogOpen, setExitDialogOpen] = React.useState(false);
  const isMarketplacePath = React.useCallback((p: string | null | undefined) => {
    if (!p) return false;
    return p.startsWith("/admin/marketplace") || p.startsWith("/marketplace/admin");
  }, []);

  const active = (path: string) =>
    pathname === path || pathname?.startsWith(`${path}/`);

  const isMarketplace = isMarketplacePath(pathname);
  const isLeilao = !isMarketplace;

  return (
    <aside
      className={cn(
        "flex h-full w-[310px] min-w-[310px] max-w-[310px] shrink-0 flex-row overflow-hidden border-r border-zinc-200 bg-white",
        className
      )}
    >
      {/* sub-sidebar reduzida */}
      <div className="flex h-full w-[80px] shrink-0 flex-col items-center border-r border-zinc-200 px-2 pb-6 pt-10">
        <AdminMiniSidebarLink
          href="/admin/dashboard"
          onClick={() => onNavigate?.()}
          label="Leilão"
          icon={AuctionIcon}
          active={isLeilao}
        />

        <div className="mt-3">
          <AdminMiniSidebarLink
            href="/admin/marketplace/dashboard"
            onClick={() => onNavigate?.()}
            label="Marketplace"
            icon={ShoppingBag01Icon}
            active={isMarketplace}
          />
        </div>

        <div className="mb-2 mt-auto">
          <button
            type="button"
            aria-label="Sair do Admin"
            onClick={() => setExitDialogOpen(true)}
            className="flex h-[76px] w-[64px] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <HugeiconsIcon
              icon={Logout01Icon}
              size={22}
              color="currentColor"
              strokeWidth={1.8}
            />
            <span className="text-center text-[11px] font-semibold leading-none">
              Sair
            </span>
          </button>
        </div>

        <AdminExitDialog
          open={exitDialogOpen}
          onClose={() => setExitDialogOpen(false)}
          onGoHome={() => {
            setExitDialogOpen(false);
            onNavigate?.();
            router.push("/");
          }}
          onLogout={() => {
            setExitDialogOpen(false);
            onNavigate?.();
            router.push("/auth");
          }}
        />
      </div>

      {/* sidebar completa: altura da viewport; só o menu rola se precisar */}
      <div className="flex h-full min-h-0 w-[230px] flex-1 flex-col overflow-hidden">
        <div className="shrink-0 px-6 pb-3 pt-2">
          <div className="flex flex-col items-center justify-center gap-2">
            <Logo variant="default" size={120} className="h-auto w-auto object-contain" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <AdminMainNav
            pathname={pathname ?? ""}
            active={active}
            isMarketplace={isMarketplace}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </aside>
  );
}
