"use client";

import React from "react";
import {
  Home09Icon,
  UserMultipleIcon,
  AuctionIcon,
  LegalHammerIcon,
  PackageIcon,
  Megaphone01Icon,
  Alert02Icon,
  ShoppingBag01Icon,
  DocumentAttachmentIcon,
} from "@hugeicons/core-free-icons";
import { AdminSidebarLink } from "@/components/admin/sidebar/admin-sidebar-link";
import { AdminProfileCard } from "@/components/admin/sidebar/admin-profile-card";

type AdminMainNavProps = {
  pathname: string;
  active: (path: string) => boolean;
  isMarketplace: boolean;
  onNavigate?: () => void;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentProps<typeof AdminSidebarLink>["icon"];
  exact?: boolean;
};

export function AdminMainNav({
  pathname,
  active,
  isMarketplace,
  onNavigate,
}: AdminMainNavProps) {
  const leilaoItems: NavItem[] = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home09Icon, exact: true },
    { href: "/admin/comitentes", label: "Comitentes", icon: UserMultipleIcon },
    { href: "/admin/leiloeiros", label: "Leiloeiros", icon: LegalHammerIcon },
    { href: "/admin/leiloes", label: "Leilões", icon: AuctionIcon },
    { href: "/admin/documentos", label: "Documentos", icon: DocumentAttachmentIcon },
    { href: "/admin/lotes", label: "Lotes", icon: PackageIcon },
    { href: "/admin/bens-itens", label: "Bens / Itens", icon: ShoppingBag01Icon },
    { href: "/admin/banners", label: "Banners", icon: Megaphone01Icon },
    { href: "/admin/avisos", label: "Gestão de usuários", icon: Alert02Icon },
  ];

  const marketplaceItems: NavItem[] = [
    {
      href: "/admin/marketplace/dashboard",
      label: "Dashboard",
      icon: Home09Icon,
      exact: true,
    },
    {
      href: "/admin/marketplace/anuncios",
      label: "Anúncios",
      icon: ShoppingBag01Icon,
    },
    {
      href: "/admin/marketplace/vendedores",
      label: "Vendedores",
      icon: UserMultipleIcon,
    },
    { href: "/admin/marketplace/banners", label: "Banners", icon: Megaphone01Icon },
    { href: "/admin/marketplace/avisos", label: "Gestão de usuários", icon: Alert02Icon },
  ];

  const navItems = isMarketplace ? marketplaceItems : leilaoItems;

  function isItemActive(item: NavItem) {
    if (item.exact) {
      return pathname === item.href;
    }
    return active(item.href);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-0 pb-2">
        <div className="space-y-1 pr-1">
          {navItems.map((item) => (
            <AdminSidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isItemActive(item)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-zinc-100 bg-white px-1 pb-4 pt-3">
        <AdminProfileCard
          href={isMarketplace ? "/admin/marketplace/perfil" : "/admin/perfil"}
          active={active(isMarketplace ? "/admin/marketplace/perfil" : "/admin/perfil")}
          name="Pietro"
          subtitle="Conta ativa"
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
