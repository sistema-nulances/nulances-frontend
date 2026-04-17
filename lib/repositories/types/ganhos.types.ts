export type ComitenteTipoApi =
  | "BANCO"
  | "SEGURADORA"
  | "EMPRESA"
  | "PESSOA_FISICA"
  | (string & {});

export type DocumentoLoteResponse = {
  id?: string | null;
  nome?: string | null;
  tipo?: string | null;
  url?: string | null;
  disponivel?: boolean;
};

export type ComitenteResumoResponse = {
  id?: string | null;
  nome?: string | null;
  tipo?: ComitenteTipoApi | null;
};

export type ContatoLoteResponse = {
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
};

export type LeilaoGanhoItemResponse = {
  id: string;
  leilaoId?: string | null;
  leilaoLoteId?: string | null;
  leilaoLoteBemId?: string | null;
  loteId?: string | null;
  bemId?: string | null;
  tituloLeilao?: string | null;
  codigoLote?: string | null;
  titulo?: string | null;
  marcaVeiculo?: string | null;
  modelo?: string | null;
  tipoVeiculo?: string | null;
  cidade?: string | null;
  endereco?: string | null;
  anoFabricacao?: number | null;
  anoModelo?: number | null;
  quilometragem?: number | null;
  cambio?: string | null;
  combustivel?: string | null;
  placaVeiculo?: string | null;
  midiaCapaUrl?: string | null;
  valorArrematado?: number | null;
  aberturaDisputa?: string | null;
  encerramentoDisputa?: string | null;
  comitente?: ComitenteResumoResponse | null;
  documentos?: DocumentoLoteResponse[] | null;
  contato?: ContatoLoteResponse | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type LeiloesGanhosResponse = {
  itens: LeilaoGanhoItemResponse[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
};
