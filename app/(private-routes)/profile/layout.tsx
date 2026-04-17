import type { ReactNode } from "react";

import { AuthenticatedGuard } from "@/components/auth/authenticated-guard";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <AuthenticatedGuard>{children}</AuthenticatedGuard>
      <MobileBottomNav />
    </div>
  );
}
