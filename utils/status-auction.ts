import { AuctionStatus } from "@/data/auction-items";

export function getStatusLabel(status: AuctionStatus) {
  if (status === "ABERTO") return "Leilão aberto";
  if (status === "EM_BREVE") return "Abre em breve";
  return "Encerrado";
}

export function getStatusClasses(status: AuctionStatus) {
  if (status === "ABERTO") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "EM_BREVE") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-zinc-200 bg-zinc-100 text-zinc-600";
}