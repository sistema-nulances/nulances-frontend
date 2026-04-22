export type MarketplacePlanoId = "basico" | "pro" | "premium";

export type MarketplacePlano = {
  id: MarketplacePlanoId;
  nome: string;
  descricao: string;
  precoMensal: number;
  limiteAnuncios: number;
  destaque?: boolean;
};

export type MarketplacePlanoAssinatura = {
  planoId: MarketplacePlanoId;
  assinadoEm: string;
};

export const MARKETPLACE_PLANOS_UPDATED_EVENT = "nulance:marketplace-planos-updated";

const MARKETPLACE_PLANOS_STORAGE_KEY = "nulance-marketplace-planos-v1";
const MARKETPLACE_ASSINATURAS_STORAGE_KEY = "nulance-marketplace-assinaturas-v1";

const DEFAULT_PLANOS: MarketplacePlano[] = [
  {
    id: "basico",
    nome: "Básico",
    descricao: "Ideal para quem está começando a vender no marketplace.",
    precoMensal: 99,
    limiteAnuncios: 5,
  },
  {
    id: "pro",
    nome: "Pro",
    descricao: "Para vendedores com fluxo constante de anúncios.",
    precoMensal: 179,
    limiteAnuncios: 15,
    destaque: true,
  },
  {
    id: "premium",
    nome: "Premium",
    descricao: "Mais alcance para operação com volume alto.",
    precoMensal: 299,
    limiteAnuncios: 40,
  },
];

function isPlanoId(value: string): value is MarketplacePlanoId {
  return value === "basico" || value === "pro" || value === "premium";
}

function normalizePlano(raw: unknown): MarketplacePlano | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const id = String(obj.id ?? "").trim().toLowerCase();
  const nome = String(obj.nome ?? "").trim();
  const descricao = String(obj.descricao ?? "").trim();
  const precoMensal = Number(obj.precoMensal ?? 0);
  const limiteAnuncios = Number(obj.limiteAnuncios ?? 0);
  if (!isPlanoId(id) || !nome || !descricao || !Number.isFinite(precoMensal) || !Number.isFinite(limiteAnuncios)) {
    return null;
  }
  return {
    id,
    nome,
    descricao,
    precoMensal: Math.max(0, Math.round(precoMensal)),
    limiteAnuncios: Math.max(0, Math.round(limiteAnuncios)),
    destaque: Boolean(obj.destaque),
  };
}

function normalizeAssinatura(raw: unknown): MarketplacePlanoAssinatura | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const planoId = String(obj.planoId ?? "").trim().toLowerCase();
  const assinadoEm = String(obj.assinadoEm ?? "").trim();
  if (!isPlanoId(planoId) || !assinadoEm) return null;
  return { planoId, assinadoEm };
}

function readStorageJson(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function dispatchUpdatedEvent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MARKETPLACE_PLANOS_UPDATED_EVENT));
}

export function listarPlanosMarketplace(): MarketplacePlano[] {
  const parsed = readStorageJson(MARKETPLACE_PLANOS_STORAGE_KEY) as
    | { planos?: unknown[] }
    | null;
  const incoming = Array.isArray(parsed?.planos) ? parsed.planos : [];
  const byId = new Map<MarketplacePlanoId, MarketplacePlano>(DEFAULT_PLANOS.map((p) => [p.id, p]));
  for (const item of incoming) {
    const normalized = normalizePlano(item);
    if (!normalized) continue;
    byId.set(normalized.id, normalized);
  }
  return (["basico", "pro", "premium"] as MarketplacePlanoId[]).map((id) => byId.get(id)!);
}

export function salvarPlanosMarketplace(planos: MarketplacePlano[]): void {
  if (typeof window === "undefined") return;
  const sanitized = planos
    .map(normalizePlano)
    .filter((p): p is MarketplacePlano => Boolean(p));
  if (sanitized.length === 0) return;
  window.localStorage.setItem(MARKETPLACE_PLANOS_STORAGE_KEY, JSON.stringify({ planos: sanitized }));
  dispatchUpdatedEvent();
}

export function buscarPlanoMarketplacePorId(planoId: string): MarketplacePlano | null {
  const id = String(planoId ?? "").trim().toLowerCase();
  if (!isPlanoId(id)) return null;
  return listarPlanosMarketplace().find((p) => p.id === id) ?? null;
}

export function carregarAssinaturaPlanoMarketplace(userId: string): MarketplacePlanoAssinatura | null {
  const uid = userId.trim();
  if (!uid) return null;
  const parsed = readStorageJson(MARKETPLACE_ASSINATURAS_STORAGE_KEY) as
    | { assinaturas?: Record<string, unknown> }
    | null;
  const raw = parsed?.assinaturas?.[uid];
  return normalizeAssinatura(raw);
}

export function salvarAssinaturaPlanoMarketplace(
  userId: string,
  assinatura: MarketplacePlanoAssinatura
): void {
  if (typeof window === "undefined") return;
  const uid = userId.trim();
  if (!uid) return;
  const normalized = normalizeAssinatura(assinatura);
  if (!normalized) return;
  const parsed = readStorageJson(MARKETPLACE_ASSINATURAS_STORAGE_KEY) as
    | { assinaturas?: Record<string, unknown> }
    | null;
  const assinaturas = { ...(parsed?.assinaturas ?? {}) };
  assinaturas[uid] = normalized;
  window.localStorage.setItem(MARKETPLACE_ASSINATURAS_STORAGE_KEY, JSON.stringify({ assinaturas }));
  dispatchUpdatedEvent();
}
