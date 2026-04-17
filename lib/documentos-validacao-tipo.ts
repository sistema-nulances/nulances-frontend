/**
 * Nomes do enum Java `TipoDocumentoValidacao`.
 * Ajuste se o backend usar outros valores.
 */
export type DocIdentidadeTipoUi = "RG" | "CNH";

export function tipoDocumentoValidacaoEnum(docType: DocIdentidadeTipoUi, lado: "frente" | "verso"): string {
  const map = {
    RG: { frente: "RG_FRENTE", verso: "RG_VERSO" },
    CNH: { frente: "CNH_FRENTE", verso: "CNH_VERSO" },
  } as const;
  return map[docType][lado];
}
