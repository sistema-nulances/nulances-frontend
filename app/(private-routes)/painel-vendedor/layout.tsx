"use client";

import type { ReactNode } from "react";

import { SellerRoleGuard } from "@/components/auth/seller-role-guard";
import { AdminProviders } from "@/components/admin/admin-providers";
import { AdminScrollLock } from "@/components/admin/admin-scroll-lock";
import { SellerMobileBottomNav } from "@/components/seller/seller-mobile-bottom-nav";
import { SellerMainScrollArea } from "@/components/seller/seller-main-scroll-area";
import { SellerSidebar } from "@/components/seller/seller-sidebar";

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProviders>
      <AdminScrollLock />
      <div className="flex h-screen min-h-0 overflow-hidden bg-[var(--background)]">
        <div className="hidden md:flex">
          <SellerSidebar />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <SellerMainScrollArea>
            <SellerRoleGuard>{children}</SellerRoleGuard>
          </SellerMainScrollArea>
        </div>
      </div>
      <SellerMobileBottomNav />
    </AdminProviders>
  );
}
