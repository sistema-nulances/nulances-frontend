"use client";

import React from "react";

export function AdminSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-2 pt-5 text-[12px] font-semibold uppercase tracking-wider text-zinc-500">
      {children}
    </div>
  );
}
