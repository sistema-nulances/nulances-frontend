import type { DocumentoValidacaoResponse, MeResponse } from "@/lib/repositories/types/auth.types";

/** `tipo` igual ao enum do backend (ex.: RG_FRENTE) e status PENDENTE. */
export function isTipoDocumentoPendente(docs: DocumentoValidacaoResponse[] | undefined, tipoEnum: string): boolean {
  const want = tipoEnum.toUpperCase();
  return (docs ?? []).some(
    (d) =>
      String(d.tipo ?? "").toUpperCase() === want && String(d.status ?? "").toUpperCase() === "PENDENTE"
  );
}

export function isStatusDocumentoAprovado(status: unknown): boolean {
  return String(status ?? "")
    .trim()
    .toUpperCase() === "APROVADO";
}

/** Documentação KYC liberada: há itens e todos estão APROVADO. */
export function documentacaoKycTotalmenteAprovada(user: MeResponse | null): boolean {
  if (!user) return false;
  const docs = user.documentosValidacao;
  if (!Array.isArray(docs) || docs.length === 0) return false;
  return docs.every((d) => isStatusDocumentoAprovado(d.status));
}

/**
 * Ainda precisa de atenção no header: sem envio, ou algum documento não está APROVADO
 * (ex.: PENDENTE, REJEITADO).
 */
export function kycDocumentosNaoTotalmenteAprovados(user: MeResponse): boolean {
  const docs = user.documentosValidacao;
  if (!Array.isArray(docs) || docs.length === 0) return true;
  return docs.some((d) => !isStatusDocumentoAprovado(d.status));
}

/** Texto amigável para um status bruto (evita enum na UI). */
export function rotuloStatusDocumentoValidacao(status: unknown): string {
  const s = String(status ?? "")
    .trim()
    .toUpperCase();
  if (s === "PENDENTE") return "Pendente de avaliação";
  if (s === "APROVADO") return "Aprovado";
  if (s === "REJEITADO") return "Rejeitado — envie novamente";
  return s ? s.charAt(0) + s.slice(1).toLowerCase() : "—";
}

/**
 * Agrupa RG_FRENTE/RG_VERSO (e CNH_*) numa linha por documento: "RG: Pendente de avaliação".
 */
export function resumoLinhasDocumentosIdentidade(
  docs: DocumentoValidacaoResponse[] | undefined
): { key: string; linha: string }[] {
  const list = docs ?? [];
  const out: { key: string; linha: string }[] = [];

  const porGrupo = (prefix: "RG_" | "CNH_") =>
    list.filter((d) => String(d.tipo ?? "").toUpperCase().startsWith(prefix));

  const rotuloGrupo = (prefix: "RG_" | "CNH_") => (prefix === "RG_" ? "RG" : "CNH");

  const agregar = (items: DocumentoValidacaoResponse[]): string => {
    const statuses = items.map((d) => String(d.status ?? "").trim().toUpperCase());
    if (statuses.some((x) => x === "REJEITADO")) return rotuloStatusDocumentoValidacao("REJEITADO");
    if (statuses.some((x) => x === "PENDENTE")) return rotuloStatusDocumentoValidacao("PENDENTE");
    if (statuses.length > 0 && statuses.every((x) => x === "APROVADO")) {
      return rotuloStatusDocumentoValidacao("APROVADO");
    }
    return rotuloStatusDocumentoValidacao(items[0]?.status);
  };

  for (const prefix of ["RG_", "CNH_"] as const) {
    const items = porGrupo(prefix);
    if (items.length === 0) continue;
    const g = rotuloGrupo(prefix);
    out.push({ key: g, linha: `${g}: ${agregar(items)}` });
  }

  list.forEach((d, i) => {
    const t = String(d.tipo ?? "").toUpperCase();
    if (t.startsWith("RG_") || t.startsWith("CNH_")) return;
    out.push({
      key: String(d.id ?? `outro-${i}`),
      linha: `${String(d.tipo ?? "Documento")}: ${rotuloStatusDocumentoValidacao(d.status)}`,
    });
  });

  return out;
}
