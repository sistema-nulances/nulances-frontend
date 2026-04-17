"use client";

import type { ReactNode } from "react";
import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMainScrollArea } from "@/components/admin/admin-main-scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Logo } from "@/components/ui/logo";

export function AdminLayoutShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <>
      <div className="flex h-screen min-h-0 overflow-hidden bg-[var(--background)]">
        <div className="hidden shrink-0 md:flex">
          <AdminSidebar />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="relative flex shrink-0 items-center justify-center border-b border-zinc-200 bg-white py-3 md:hidden">
            <button
              type="button"
              aria-label="Abrir menu"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen(true)}
              className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-800 transition hover:bg-zinc-50"
            >
              <HugeiconsIcon icon={Menu01Icon} size={22} strokeWidth={1.8} />
            </button>
            <div className="flex min-w-0 justify-center px-14">
              <Logo
                variant="default"
                size={160}
                className="h-11 w-auto max-w-[min(100%,200px)] object-contain"
              />
            </div>
          </header>
          <AdminMainScrollArea>{children}</AdminMainScrollArea>
        </div>
      </div>

      <Sheet open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} side="left">
        <SheetContent
          className="h-[100dvh] max-h-[100dvh] min-h-[100dvh] w-[min(100vw,310px)] !max-w-[310px] rounded-r-[28px] border-r border-zinc-200 shadow-xl"
          bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-0 pb-[env(safe-area-inset-bottom)]"
          onClose={() => setMobileNavOpen(false)}
        >
          <AdminSidebar
            onNavigate={() => setMobileNavOpen(false)}
            className="border-0"
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
