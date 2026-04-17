import type { LoteBemItem } from "./lotes-admin";
import { LOTES_ADMIN_SEED } from "./lotes-admin";

/**
 * Bens disponíveis para compor lotes (mock). Inclui todos os itens já usados nos lotes seed
 * e entradas extras ainda não alocadas.
 */
const extras: LoteBemItem[] = [
  {
    id: "bem-adm-20",
    nome: "Fiat Toro Freedom 1.3 Turbo AT",
    categoria: "Picape",
    descricao: "Disponível para inclusão em lote.",
  },
  {
    id: "bem-adm-21",
    nome: "Renault Duster Iconic 1.3 TCe CVT",
    categoria: "SUV",
  },
];

const byId = new Map<string, LoteBemItem>();
for (const l of LOTES_ADMIN_SEED) {
  for (const i of l.itens) {
    byId.set(i.id, i);
  }
}
for (const e of extras) {
  byId.set(e.id, e);
}

export const BENS_CATALOGO_ADMIN: LoteBemItem[] = [...byId.values()].sort((a, b) =>
  a.nome.localeCompare(b.nome, "pt-BR")
);
