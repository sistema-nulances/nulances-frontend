export type SellerRequestStatus = "pendente" | "aprovado" | "recusado";

export type SellerAccountType = "pessoa_fisica" | "pessoa_juridica";

export type SellerRequestDocs = {
  rgFrente?: string;
  rgVerso?: string;
  cpfDocumento?: string;
  comprovanteResidencia?: string;
  selfieDocumento?: string;
  contratoSocial?: string;
};

export type SellerRequest = {
  id: string;
  userId: string;
  status: SellerRequestStatus;
  accountType: SellerAccountType;
  nomeFantasiaOuCompleto: string;
  documento: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  descricao: string;
  documentos: SellerRequestDocs;
  criadoEm: string;
  atualizadoEm: string;
};

export const SELLER_REQUESTS_STORAGE_KEY = "nulance-seller-requests-v1";
export const SELLER_REQUESTS_UPDATED_EVENT = "nulance:seller-requests";

function parseRequest(row: unknown): SellerRequest | null {
  if (!row || typeof row !== "object") return null;
  const o = row as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.userId !== "string") return null;
  if (o.status !== "pendente" && o.status !== "aprovado" && o.status !== "recusado") return null;
  if (o.accountType !== "pessoa_fisica" && o.accountType !== "pessoa_juridica") return null;
  if (
    typeof o.nomeFantasiaOuCompleto !== "string" ||
    typeof o.documento !== "string" ||
    typeof o.email !== "string" ||
    typeof o.telefone !== "string" ||
    typeof o.cidade !== "string" ||
    typeof o.estado !== "string" ||
    typeof o.descricao !== "string"
  ) {
    return null;
  }
  const docsRaw =
    o.documentos && typeof o.documentos === "object" ? (o.documentos as Record<string, unknown>) : {};
  const documentos: SellerRequestDocs = {
    rgFrente: typeof docsRaw.rgFrente === "string" ? docsRaw.rgFrente : undefined,
    rgVerso: typeof docsRaw.rgVerso === "string" ? docsRaw.rgVerso : undefined,
    cpfDocumento: typeof docsRaw.cpfDocumento === "string" ? docsRaw.cpfDocumento : undefined,
    comprovanteResidencia:
      typeof docsRaw.comprovanteResidencia === "string" ? docsRaw.comprovanteResidencia : undefined,
    selfieDocumento: typeof docsRaw.selfieDocumento === "string" ? docsRaw.selfieDocumento : undefined,
    contratoSocial: typeof docsRaw.contratoSocial === "string" ? docsRaw.contratoSocial : undefined,
  };
  const criadoEm = typeof o.criadoEm === "string" ? o.criadoEm : new Date().toISOString();
  const atualizadoEm = typeof o.atualizadoEm === "string" ? o.atualizadoEm : criadoEm;
  return {
    id: o.id,
    userId: o.userId,
    status: o.status,
    accountType: o.accountType,
    nomeFantasiaOuCompleto: o.nomeFantasiaOuCompleto,
    documento: o.documento,
    email: o.email,
    telefone: o.telefone,
    cidade: o.cidade,
    estado: o.estado,
    descricao: o.descricao,
    documentos,
    criadoEm,
    atualizadoEm,
  };
}

function loadAllSellerRequests(): Record<string, SellerRequest> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SELLER_REQUESTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { requests?: unknown };
    if (!parsed || typeof parsed !== "object" || !parsed.requests || typeof parsed.requests !== "object") {
      return {};
    }
    const out: Record<string, SellerRequest> = {};
    for (const [userId, value] of Object.entries(parsed.requests as Record<string, unknown>)) {
      const req = parseRequest(value);
      if (!req || req.userId !== userId) continue;
      out[userId] = req;
    }
    return out;
  } catch {
    return {};
  }
}

function saveAllSellerRequests(requests: Record<string, SellerRequest>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SELLER_REQUESTS_STORAGE_KEY, JSON.stringify({ requests }));
  window.dispatchEvent(new Event(SELLER_REQUESTS_UPDATED_EVENT));
}

export function loadSellerRequest(userId: string): SellerRequest | null {
  const id = userId.trim();
  if (!id) return null;
  const all = loadAllSellerRequests();
  return all[id] ?? null;
}

export function upsertSellerRequest(
  userId: string,
  payload: Omit<SellerRequest, "id" | "userId" | "criadoEm" | "atualizadoEm">
): SellerRequest {
  const id = userId.trim();
  const all = loadAllSellerRequests();
  const existing = all[id];
  const now = new Date().toISOString();
  const next: SellerRequest = {
    id:
      existing?.id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `seller-${now}-${Math.random().toString(36).slice(2, 8)}`),
    userId: id,
    criadoEm: existing?.criadoEm ?? now,
    atualizadoEm: now,
    ...payload,
  };
  all[id] = next;
  saveAllSellerRequests(all);
  return next;
}

export function isSellerFromRequest(req: SellerRequest | null | undefined): boolean {
  return req?.status === "aprovado";
}
