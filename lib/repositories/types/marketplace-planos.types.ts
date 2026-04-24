export type PlanoMarketplaceNomeApi = "BASICO" | "PRO" | "PREMIUM" | (string & {});

export type AssinaturaPlanoStatusApi =
  | "PENDENTE_PAGAMENTO"
  | "ATIVA"
  | "INADIMPLENTE"
  | "CANCELADA"
  | (string & {});

export type StatusPagamentoPlanoApi =
  | "GERADO"
  | "PAGO"
  | "FALHOU"
  | "EXPIRADO"
  | "CANCELADO"
  | (string & {});

export type TipoFaturaPlanoApi = "ADESAO" | "RENOVACAO" | (string & {});

export type PlanoAnuncioResponse = {
  id: string;
  nome: PlanoMarketplaceNomeApi;
  descricao: string;
  valorMensal: number;
  totalAnuncios: number;
  ativo: boolean;
  /** Plano sem limite de anúncios — quando true, `anunciosDisponiveis` é null. */
  ilimitado?: boolean | null;
};

export type AssinaturaPlanoAtualResponse = {
  assinaturaId: string;
  status: AssinaturaPlanoStatusApi;
  inicioVigencia: string;
  proximaCobranca: string;
  anunciosDisponiveis: number;
  plano: PlanoAnuncioResponse;
};

export type VendedorPlanosResponse = {
  planosDisponiveis: PlanoAnuncioResponse[];
  assinaturaAtual: AssinaturaPlanoAtualResponse | null;
};

export type AssinarPlanoRequest = {
  planoId: string;
};

export type AssinarPlanoResponse = {
  pagamentoId: string;
  referencia: string;
  checkoutUrl: string;
  status: StatusPagamentoPlanoApi;
};

export type AtualizarPlanoMarketplaceRequest = {
  valorMensal?: number;
  totalAnuncios?: number;
  ativo?: boolean;
};

export type FaturaPlanoResponse = {
  pagamentoId: string;
  referencia: string;
  plano: string;
  valor: number;
  status: StatusPagamentoPlanoApi;
  tipo: TipoFaturaPlanoApi;
  dataVencimento: string;
  pagoEm?: string | null;
  checkoutUrl?: string | null;
};
