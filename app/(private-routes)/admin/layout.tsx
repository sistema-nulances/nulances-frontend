"use client";

import type { ReactNode } from "react";

import { AdminRoleGuard } from "@/components/auth/admin-role-guard";
import { AdminProviders } from "@/components/admin/admin-providers";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminScrollLock } from "@/components/admin/admin-scroll-lock";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProviders>
      <AdminScrollLock />
      <AdminLayoutShell>
        <AdminRoleGuard>{children}</AdminRoleGuard>
      </AdminLayoutShell>
    </AdminProviders>
  );
}
