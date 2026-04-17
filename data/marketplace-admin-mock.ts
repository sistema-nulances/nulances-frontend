import type { MarketplaceCategory } from "@/data/marketplace-items";

/** Anúncio aguardando aprovação (mock admin). */
export type MarketplaceModerationPending = {
  id: number;
  titulo: string;
  categoria: MarketplaceCategory;
  /** ISO 8601 */
  enviadoEm: string;
  vendedor: string;
};

export type MarketplaceActivityTipo = "novo" | "edicao" | "encerrado" | "suspenso";

export type MarketplaceActivityEvent = {
  id: string;
  tipo: MarketplaceActivityTipo;
  anuncioId: number;
  titulo: string;
  /** ISO 8601 */
  ocorreuEm: string;
  /** Detalhe curto (ex.: campos alterados). */
  detalhe?: string;
};

/** Datas fixas (ISO) para evitar divergência SSR/hidratação — não usar Date.now() em seeds. */
const T = {
  m25: "2026-04-02T17:35:00.000Z",
  h1: "2026-04-02T17:00:00.000Z",
  h2: "2026-04-02T16:00:00.000Z",
  h3: "2026-04-02T15:00:00.000Z",
  h5: "2026-04-02T13:00:00.000Z",
  h6: "2026-04-02T12:00:00.000Z",
  h9: "2026-04-02T09:00:00.000Z",
  h18: "2026-04-02T00:00:00.000Z",
} as const;

/** Query sugerida na lista de anúncios (filtro futuro). */
export const MARKETPLACE_ANUNCIOS_MODERACAO_QUERY = "moderacao=pendentes" as const;

export const marketplaceAdminPendingModeration: MarketplaceModerationPending[] = [
  {
    id: 201,
    titulo: "Renault Duster Iconic 1.6 CVT",
    categoria: "carros",
    enviadoEm: T.m25,
    vendedor: "AutoMax DF",
  },
  {
    id: 202,
    titulo: "Honda CG 160 Titan",
    categoria: "motos",
    enviadoEm: T.h2,
    vendedor: "João P. Souza",
  },
  {
    id: 203,
    titulo: "Mercedes-Benz Atego 2426",
    categoria: "caminhoes",
    enviadoEm: T.h5,
    vendedor: "Transportes Sul",
  },
  {
    id: 204,
    titulo: "Peugeot 208 Griffe 1.6 AT",
    categoria: "carros",
    enviadoEm: T.h18,
    vendedor: "Maria Helena Veículos",
  },
];

export const marketplaceAdminRecentActivity: MarketplaceActivityEvent[] = [
  {
    id: "ev-1",
    tipo: "novo",
    anuncioId: 201,
    titulo: "Renault Duster Iconic 1.6 CVT",
    ocorreuEm: T.m25,
  },
  {
    id: "ev-2",
    tipo: "edicao",
    anuncioId: 103,
    titulo: "Jeep Compass Longitude 2.0 Flex AT",
    ocorreuEm: T.h1,
    detalhe: "Preço e quilometragem atualizados",
  },
  {
    id: "ev-3",
    tipo: "encerrado",
    anuncioId: 99,
    titulo: "Nissan Kicks SV CVT (referência mock)",
    ocorreuEm: T.h3,
    detalhe: "Vendido pela plataforma",
  },
  {
    id: "ev-4",
    tipo: "suspenso",
    anuncioId: 88,
    titulo: "Foto inconsistente — anúncio #88 (mock)",
    ocorreuEm: T.h6,
    detalhe: "Política de imagens",
  },
  {
    id: "ev-5",
    tipo: "novo",
    anuncioId: 202,
    titulo: "Honda CG 160 Titan",
    ocorreuEm: T.h2,
  },
  {
    id: "ev-6",
    tipo: "edicao",
    anuncioId: 101,
    titulo: "Toyota Corolla Altis 2.0 Hybrid",
    ocorreuEm: T.h9,
    detalhe: "Descrição revisada",
  },
];
