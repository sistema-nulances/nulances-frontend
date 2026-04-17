import type {
  LeiloeiroListResponse,
  LeiloeiroResponse,
} from "@/lib/repositories/types/leiloeiro.types";

export type LeiloeiroRow = {
  id: string;
  nome: string;
  registro: string;
  documento: string;
  email: string;
  telefone: string;
  localPrincipal: string;
  ativo: boolean;
  /** Quantidade de leilões vinculados — valor típico da API */
  leiloesVinculados: number;
};

export type LeiloeiroDashboardStats = {
  totalLeiloeiros: number;
  totalAtivos: number;
  totalInativos: number;
  comLeiloes: number;
};

function leiloeiroParaRowBase(r: {
  id: string;
  nome: string;
  registroProfissional: string;
  cpf: string;
  email: string;
  telefone?: string | null;
  local?: string | null;
  ativoPlataforma: boolean;
  totalLeiloes?: number | null;
}): LeiloeiroRow {
  return {
    id: r.id,
    nome: r.nome,
    registro: r.registroProfissional,
    documento: r.cpf,
    email: r.email,
    telefone: r.telefone ?? "",
    localPrincipal: r.local ?? "",
    ativo: r.ativoPlataforma,
    leiloesVinculados: r.totalLeiloes ?? 0,
  };
}

export function leiloeiroListResponseParaRow(r: LeiloeiroListResponse): LeiloeiroRow {
  return leiloeiroParaRowBase(r);
}

export function leiloeiroResponseParaRow(r: LeiloeiroResponse): LeiloeiroRow {
  return leiloeiroParaRowBase(r);
}

export function buildLeiloeiroStats(rows: LeiloeiroRow[]): LeiloeiroDashboardStats {
  return {
    totalLeiloeiros: rows.length,
    totalAtivos: rows.filter((r) => r.ativo).length,
    totalInativos: rows.filter((r) => !r.ativo).length,
    comLeiloes: rows.filter((r) => r.leiloesVinculados > 0).length,
  };
}
