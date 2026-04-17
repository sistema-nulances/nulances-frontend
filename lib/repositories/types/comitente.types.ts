export type TipoComitenteApi = "EMPRESA" | "BANCO" | "SEGURADORA" | "PESSOA_FISICA";

export type ComitenteCreateRequest = {
  nome: string;
  tipo: TipoComitenteApi;
  documento: string;
  ativoPlataforma?: boolean;
  sede?: string | null;
};

export type ComitenteUpdateRequest = {
  nome?: string;
  tipo?: TipoComitenteApi;
  documento?: string;
  ativoPlataforma?: boolean;
  sede?: string | null;
};

export type ComitenteListResponse = {
  id: string;
  nome: string;
  status: string;
  tipo: TipoComitenteApi;
  documento: string;
  totalLeiloes?: number | null;
  totalLeiloesAoVivo?: number | null;
  totalLeiloesEmBreve?: number | null;
  totalLeiloesEncerrado?: number | null;
};

export type ComitenteResponse = {
  id: string;
  nome: string;
  tipo: TipoComitenteApi;
  documento: string;
  ativoPlataforma: boolean;
  sede?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ComitenteStatsResponse = {
  totalComitentes: number;
  totalBancos: number;
  totalSeguradoras: number;
  totalPessoaFisica: number;
  totalEmpresas: number;
};

/** `GET /admin/comitentes/disponibilidade` — alinhado a `ComitenteDisponibilidadeResponse` no backend. */
export type ComitenteDisponibilidadeResponse = {
  disponivel: boolean;
  mensagem: string | null;
};
