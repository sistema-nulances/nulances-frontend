export type StatusAnuncioAdminApi =
  | "PENDENTE"
  | "PUBLICADO"
  | "SUSPENSO"
  | "REPROVADO"
  | "CANCELADO"
  | (string & {});

export type ListarAdminAnunciosRequest = {
  status?: StatusAnuncioAdminApi;
  /** Filtro por modelo (backend: `busca`). */
  busca?: string;
  /** Filtro por nome do vendedor (backend: `vendedor`). */
  vendedor?: string;
  page?: number;
  size?: number;
};

export type SuspenderAnuncioRequest = {
  motivo?: string;
};

export type AnuncioMidiaAdminListResponse = {
  id?: string;
  tipo?: string;
  arquivo?: string;
  arquivoUrl?: string;
  url?: string;
  ordem?: number;
};

export type AnuncioAdminListResponse = {
  id: string;
  modelo?: string | null;
  marcaVeiculo?: string | null;
  valor?: number | null;
  status?: StatusAnuncioAdminApi | null;
  quandoFoiPostado?: string | null;
  vendedorNome?: string | null;
  midias?: AnuncioMidiaAdminListResponse[] | null;
};

export type AnuncioStatusResponse = {
  id?: string;
  status?: StatusAnuncioAdminApi | null;
  mensagem?: string;
};

/** `GET /admin/anuncios/dashboard/stats-marketplace` */
export type DashboardStatsMarketplaceResponse = {
  totalAnuncios: number;
  totalPublicados: number;
  totalPendentes: number;
  totalSuspensos: number;
};

/** `GET /admin/anuncios/moderar/dashboard` — fila de moderação (preview). */
export type AnuncioModerarListResponse = {
  id: string;
  modelo: string;
  nomeVendedor: string;
  enviadoEm: string;
  tipoVeiculo?: string | null;
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};
