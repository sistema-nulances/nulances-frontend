export type AdminDashboardLeilaoAoVivoItemResponse = {
  tituloLeilao: string;
  encerraEm?: string | null;
  lote: string;
  local: string;
  status?: string | null;
  lanceAtual?: number | null;
};

export type AdminDashboardLeiloesResponse = {
  totalLotesCadastrados: number;
  totalLeiloesAoVivo: number;
  totalLeiloesEmBreve: number;
  leiloesAoVivo: AdminDashboardLeilaoAoVivoItemResponse[];
};
