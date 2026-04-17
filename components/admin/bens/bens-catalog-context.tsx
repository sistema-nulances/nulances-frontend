"use client";

import * as React from "react";

import type { LoteBemItem } from "@/data/lotes-admin";
import { bemResumoParaLoteItem } from "@/lib/bem-api-mapper";
import { listarBensAdmin } from "@/lib/repositories/admin-bens-repository";

type BensCatalogContextValue = {
  items: LoteBemItem[];
  setItems: React.Dispatch<React.SetStateAction<LoteBemItem[]>>;
  /** Recarrega até 500 bens (ex.: picker de lotes). */
  refreshFromApi: () => Promise<void>;
};

const BensCatalogContext = React.createContext<BensCatalogContextValue | null>(null);

export function BensCatalogProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<LoteBemItem[]>([]);

  const refreshFromApi = React.useCallback(async () => {
    try {
      const page = await listarBensAdmin({ page: 0, size: 500 });
      setItems(page.content.map(bemResumoParaLoteItem));
    } catch {
      /* silencioso: páginas podem tratar erro localmente */
    }
  }, []);

  React.useEffect(() => {
    void refreshFromApi();
  }, [refreshFromApi]);

  const value = React.useMemo(() => ({ items, setItems, refreshFromApi }), [items, refreshFromApi]);

  return <BensCatalogContext.Provider value={value}>{children}</BensCatalogContext.Provider>;
}

export function useBensCatalog() {
  const ctx = React.useContext(BensCatalogContext);
  if (!ctx) {
    throw new Error("useBensCatalog deve ser usado dentro de BensCatalogProvider");
  }
  return ctx;
}
