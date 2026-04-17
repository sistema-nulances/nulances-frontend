import type { KycStatusUsuario, UsuarioDocumentosKyc } from "@/data/usuarios-documentos-kyc";

export type KycTabFilter = "todos" | KycStatusUsuario;

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function buildKycStats(rows: UsuarioDocumentosKyc[]) {
  let aprovado = 0;
  let pendente = 0;
  let recusado = 0;
  for (const r of rows) {
    if (r.status === "aprovado") aprovado += 1;
    else if (r.status === "pendente") pendente += 1;
    else recusado += 1;
  }
  return { total: rows.length, aprovado, pendente, recusado };
}

export function filterUsuariosKyc(
  rows: UsuarioDocumentosKyc[],
  tab: KycTabFilter,
  search: string
): UsuarioDocumentosKyc[] {
  let list = tab === "todos" ? rows : rows.filter((r) => r.status === tab);
  const q = normalize(search);
  if (!q) return list;
  return list.filter((r) => {
    const hay = normalize(
      `${r.nome} ${r.email} ${r.telefone} ${r.cpfMascarado} ${r.cidade} ${r.uf} ${r.id}`
    );
    return hay.includes(q);
  });
}
