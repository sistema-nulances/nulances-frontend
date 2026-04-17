export type AvisoTipo = "dismissivel" | "permanente";

export type Aviso = {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: AvisoTipo;
  /** Menor = aparece primeiro. */
  ordem: number;
  criadoEm: string;
  atualizadoEm: string;
};

export const AVISOS_STORAGE_KEY = "nulance-avisos-v1";
export const AVISOS_DISMISSED_STORAGE_KEY = "nulance-avisos-dismissed-v1";
export const AVISOS_UPDATED_EVENT = "nulance:avisos";

export const MARKETPLACE_AVISOS_STORAGE_KEY = "nulance-marketplace-avisos-v1";
export const MARKETPLACE_AVISOS_DISMISSED_STORAGE_KEY = "nulance-marketplace-avisos-dismissed-v1";
export const MARKETPLACE_AVISOS_UPDATED_EVENT = "nulance:marketplace-avisos";

export type AvisoScope = "site" | "marketplace";

function avisosKeys(scope: AvisoScope) {
  if (scope === "marketplace") {
    return {
      storage: MARKETPLACE_AVISOS_STORAGE_KEY,
      dismissed: MARKETPLACE_AVISOS_DISMISSED_STORAGE_KEY,
      event: MARKETPLACE_AVISOS_UPDATED_EVENT,
    };
  }
  return {
    storage: AVISOS_STORAGE_KEY,
    dismissed: AVISOS_DISMISSED_STORAGE_KEY,
    event: AVISOS_UPDATED_EVENT,
  };
}

function parseAvisos(raw: string | null): Aviso[] | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as { avisos?: unknown };
    if (!Array.isArray(p.avisos)) return null;
    const out: Aviso[] = [];
    for (const row of p.avisos) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      if (typeof o.id !== "string" || typeof o.titulo !== "string" || typeof o.conteudo !== "string") continue;
      if (o.tipo !== "dismissivel" && o.tipo !== "permanente") continue;
      const ordem = typeof o.ordem === "number" && Number.isFinite(o.ordem) ? o.ordem : 0;
      const criadoEm = typeof o.criadoEm === "string" ? o.criadoEm : new Date().toISOString();
      const atualizadoEm = typeof o.atualizadoEm === "string" ? o.atualizadoEm : criadoEm;
      out.push({
        id: o.id,
        titulo: o.titulo,
        conteudo: o.conteudo,
        tipo: o.tipo,
        ordem,
        criadoEm,
        atualizadoEm,
      });
    }
    return out;
  } catch {
    return null;
  }
}

export function loadAvisos(scope: AvisoScope = "site"): Aviso[] {
  if (typeof window === "undefined") return [];
  const k = avisosKeys(scope);
  const parsed = parseAvisos(localStorage.getItem(k.storage));
  return parsed ?? [];
}

export function saveAvisos(avisos: Aviso[], scope: AvisoScope = "site"): void {
  if (typeof window === "undefined") return;
  const k = avisosKeys(scope);
  localStorage.setItem(k.storage, JSON.stringify({ avisos }));
  window.dispatchEvent(new Event(k.event));
}

export function sortAvisos(avisos: Aviso[]): Aviso[] {
  return [...avisos].sort((a, b) => {
    if (a.ordem !== b.ordem) return a.ordem - b.ordem;
    return a.criadoEm.localeCompare(b.criadoEm);
  });
}

export function loadDismissedIds(scope: AvisoScope = "site"): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const k = avisosKeys(scope);
    const raw = localStorage.getItem(k.dismissed);
    if (!raw) return new Set();
    const p = JSON.parse(raw) as { ids?: unknown };
    if (!Array.isArray(p.ids)) return new Set();
    return new Set(p.ids.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export function dismissAviso(id: string, scope: AvisoScope = "site"): void {
  if (typeof window === "undefined") return;
  const k = avisosKeys(scope);
  const next = loadDismissedIds(scope);
  next.add(id);
  localStorage.setItem(k.dismissed, JSON.stringify({ ids: [...next] }));
}

export function removeDismissedId(id: string, scope: AvisoScope = "site"): void {
  if (typeof window === "undefined") return;
  const k = avisosKeys(scope);
  const next = loadDismissedIds(scope);
  next.delete(id);
  localStorage.setItem(k.dismissed, JSON.stringify({ ids: [...next] }));
}

export function novoAvisoDraft(ordem: number): Aviso {
  const now = new Date().toISOString();
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `av-${now}-${Math.random().toString(36).slice(2, 9)}`,
    titulo: "",
    conteudo: "",
    tipo: "dismissivel",
    ordem,
    criadoEm: now,
    atualizadoEm: now,
  };
}
