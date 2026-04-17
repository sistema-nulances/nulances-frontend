export type FormatoLeilaoApi = "ONLINE" | "PRESENCIAL";

export type LeilaoCreateRequest = {
  titulo: string;
  formato: FormatoLeilaoApi;
  cidade?: string | null;
  endereco?: string | null;
  leiloeiroId: string;
  comitenteId: string;
  lotes: Array<{
    loteId: string;
    bens: Array<{
      bemId: string;
      valorInicial: number;
      incrementoMinimo: number;
      aberturaDisputa: string;
      encerramentoDisputa: string;
    }>;
  }>;
};

export type LeilaoResponse = {
  id: string;
  titulo: string;
  formato: string;
  cidade?: string | null;
  endereco?: string | null;
  leiloeiroId: string;
  comitenteId: string;
  inicioLeilao: string;
  fimLeilao: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  lotes?: Array<{
    leilaoLoteId: string;
    loteId: string;
    codigoLote: string;
    bens?: Array<{
      leilaoLoteBemId: string;
      bemId: string;
      /** Enum `MarcaVeiculo` da API (ex.: `BENTLEY`). */
      marcaVeiculo?: string;
      tipoVeiculo?: string;
      modelo?: string;
      descricao?: string;
      ano?: number;
      quilometragem?: number;
      cambio?: string;
      combustivel?: string;
      condicao?: string;
      valorInicial: number;
      incrementoMinimo: number;
      lanceAtual?: number | null;
      proximoLance?: number | null;
      aberturaDisputa: string;
      encerramentoDisputa: string;
      status?: StatusItemLeilaoApi;
      midias?: Array<{
        id?: string;
        tipo?: string;
        arquivo?: string;
        ordem?: number;
      }>;
    }>;
  }>;
};

export type StatusItemLeilaoApi =
  | "AGUARDANDO_ABERTURA"
  | "ABERTO"
  | "ENCERRADO"
  | "PROCESSANDO_RESULTADO"
  | "ARREMATADO"
  | "SEM_LANCES"
  | (string & {});

export type StatusLeilaoApi = "ABERTO" | "EM_BREVE" | "ENCERRADO" | (string & {});

export type LeilaoPainelResponse = {
  leilaoId: string;
  titulo: string;
  leiloeiro: string;
  formato: FormatoLeilaoApi | (string & {});
  cidade?: string | null;
  status: StatusLeilaoApi;
  encerramentoLeilao: string;
  itemEmPauta?: {
    leilaoLoteBemId: string;
    loteId: string;
    codigoLote: string;
    bemId: string;
    nomeBem: string;
    valorAtual?: number | null;
    proximoLance?: number | null;
    valorInicial: number;
    status: StatusItemLeilaoApi;
    aberturaDisputa: string;
    encerramentoDisputa: string;
  } | null;
  itens: Array<{
    leilaoLoteBemId: string;
    loteId: string;
    codigoLote: string;
    bemId: string;
    nomeBem: string;
    status: StatusItemLeilaoApi;
    valorAtual?: number | null;
    proximoLance?: number | null;
    valorInicial: number;
    aberturaDisputa: string;
    encerramentoDisputa: string;
  }>;
  atividadesRecentes: Array<{
    loteCodigo: string;
    nomeBem: string;
    acao: string;
    dataHora: string;
    usuarioNome?: string | null;
    valor?: number | null;
  }>;
  stats?: {
    totalLotesCatalogo: number;
    totalLances: number;
    totalUsuariosDistintos: number;
  } | null;
};

export type LeilaoItemDetalheResponse = {
  leilaoId: string;
  leilaoLoteId: string;
  leilaoLoteBemId: string;
  loteId: string;
  bemId: string;
  tituloLeilao?: string;
  codigoLote?: string;
  modelo?: string;
  /** Enum `MarcaVeiculo` da API (ex.: `PORSCHE`). */
  marcaVeiculo?: string;
  descricao?: string;
  cidade?: string | null;
  formatoLeilao?: FormatoLeilaoApi | (string & {});
  tipoVeiculo?: string;
  ano?: number;
  quilometragem?: number | null;
  cambio?: string;
  combustivel?: string;
  condicao?: string;
  blindado?: boolean;
  cor?: string | null;
  placaVeiculo?: string | null;
  finalChassi?: string | null;
  statusLeilao?: StatusLeilaoApi;
  statusItem?: StatusItemLeilaoApi;
  valorInicial: number;
  incrementoMinimo: number;
  lanceAtual?: number | null;
  proximoLance?: number | null;
  aberturaDisputa: string;
  encerramentoDisputa: string;
  leiloeiroNome?: string | null;
  comitenteNome?: string | null;
  incrementosSugeridos?: number[];
  midias?: Array<{
    id?: string;
    tipo?: string;
    arquivo?: string;
    ordem?: number;
  }>;
  historicoLances?: Array<{
    lanceId?: string;
    valor: number;
    dataHora: string;
    usuarioNome?: string | null;
  }>;
};
