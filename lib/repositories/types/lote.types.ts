/** Alinhado ao backend Java (enums em STRING no JSON). */

export type CriarLoteRequest = {
  nome: string;
  observacoes?: string | null;
  bemIds: string[];
};

export type EditarLoteRequest = {
  nome?: string;
  observacoes?: string | null;
  bemIds?: string[];
};

export type LoteResponse = {
  id: string;
  nome: string;
  codigo: string;
  observacoes?: string | null;
  status: string;
  bemIds?: string[];
  leilaoId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

/** Lista admin — ajuste campos se o DTO Java for diferente. */
export type LoteListResponse = {
  id: string;
  nome: string;
  codigo: string;
  observacoes?: string | null;
  status: string;
  bemIds?: string[];
  totalBens?: number;
  nomeLeilao?: string | null;
  quantidadeBens?: number;
  leilaoId?: string | null;
};

export type LoteStatsResponse = {
  totalLotes: number;
  totalDisponiveis: number;
  totalEmLeilao: number;
  totalEncerrados: number;
};
