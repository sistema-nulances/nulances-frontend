import type { MarketplaceAnuncioAdmin } from "@/lib/marketplace-anuncios-admin";

export function parseAnoFabMod(ano: string): { fab: string; mod: string } {
  const s = ano.replace(/—/g, "").trim();
  if (!s) return { fab: "—", mod: "—" };
  const parts = s.split("/").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return { fab: parts[0]!, mod: parts[1]! };
  return { fab: parts[0]!, mod: parts[0]! };
}

/** Texto após marca + modelo no título (versão / acabamento). */
export function deriveVersaoAcabamento(a: MarketplaceAnuncioAdmin): string {
  const t = a.titulo.trim();
  const prefix = `${a.marca} ${a.modelo}`.trim();
  if (!prefix || prefix === "— —") return "—";
  if (t.toLowerCase().startsWith(prefix.toLowerCase())) {
    const rest = t.slice(prefix.length).trim();
    return rest || "—";
  }
  return "—";
}

export function categoriaVeiculoDisplay(a: MarketplaceAnuncioAdmin): string {
  const t = a.tipoVeiculo?.trim();
  if (t) return t;
  if (a.categoria === "motos") return "Moto";
  if (a.categoria === "caminhoes") return "Caminhão";
  return "Carro";
}

export function isCombustivelHibridoOuEletrico(combustivel: string): boolean {
  const c = combustivel.toLowerCase();
  return c.includes("híbr") || c.includes("hibr") || c.includes("elétr") || c.includes("eletr");
}

/** Ex.: `OPQ3R56` → `OPQ * 56` (referência parcial em documentação). */
export function maskPlacaReferenciaParcial(placa: string): string {
  const c = placa.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (c.length < 5) return placa.trim() || "—";
  return `${c.slice(0, 3)} * ${c.slice(-2)}`;
}
