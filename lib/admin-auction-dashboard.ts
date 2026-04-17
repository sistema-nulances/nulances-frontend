import type { AuctionItem, AuctionStatus } from "@/data/auction-items";

export type AuctionDashboardCounts = {
  total: number;
  porStatus: Record<AuctionStatus, number>;
  encerramHoje: number;
  abremHoje: number;
};

export function computeAuctionDashboardCounts(items: AuctionItem[]): AuctionDashboardCounts {
  const porStatus: Record<AuctionStatus, number> = {
    ABERTO: 0,
    EM_BREVE: 0,
    ENCERRADO: 0,
  };
  for (const it of items) {
    porStatus[it.status] += 1;
  }
  const encerramHoje = items.filter((i) => i.dataEncerramento.toLowerCase().includes("hoje")).length;
  const abremHoje = items.filter((i) => i.dataAbertura.toLowerCase().includes("hoje")).length;
  return { total: items.length, porStatus, encerramHoje, abremHoje };
}

export function selectLeiloesAoVivo(items: AuctionItem[], limit: number): AuctionItem[] {
  return items.filter((i) => i.status === "ABERTO").slice(0, limit);
}

export function selectProximosLeiloes(items: AuctionItem[], limit: number): AuctionItem[] {
  return items.filter((i) => i.status === "EM_BREVE").slice(0, limit);
}

export function selectEncerramHoje(items: AuctionItem[], limit: number): AuctionItem[] {
  return items.filter((i) => i.dataEncerramento.toLowerCase().includes("hoje")).slice(0, limit);
}
