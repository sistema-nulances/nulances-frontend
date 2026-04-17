import type { MarketplaceItem } from "@/data/marketplace-items";

export type MarketplaceDashboardCounts = {
  total: number;
  aberto: number;
  emBreve: number;
  encerrado: number;
};

export function computeMarketplaceDashboardCounts(items: MarketplaceItem[]): MarketplaceDashboardCounts {
  let aberto = 0;
  let emBreve = 0;
  let encerrado = 0;
  for (const i of items) {
    if (i.status === "ABERTO") aberto += 1;
    else if (i.status === "EM_BREVE") emBreve += 1;
    else encerrado += 1;
  }
  return { total: items.length, aberto, emBreve, encerrado };
}
