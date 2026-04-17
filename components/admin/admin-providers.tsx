"use client";

import type { ReactNode } from "react";

import { BensCatalogProvider } from "@/components/admin/bens/bens-catalog-context";

export function AdminProviders({ children }: { children: ReactNode }) {
  return <BensCatalogProvider>{children}</BensCatalogProvider>;
}
