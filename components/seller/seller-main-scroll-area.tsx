"use client";

import type { ReactNode } from "react";

export function SellerMainScrollArea({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-20 pt-6 sm:px-6 md:pb-4 lg:px-8 lg:pt-8">
      {children}
    </main>
  );
}
