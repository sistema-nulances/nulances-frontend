/** Alinhado ao backend Java (enums em STRING). */

export type StatusBem = string;

export type CriarBemRequest = {
  marca: string;
  modelo: string;
  tipoVeiculo: string;
  condicao: string;
  ano: number;
  quilometragem: number;
  finalChassi?: string | null;
  combustivel: string;
  cambio: string;
  blindado: boolean;
  cor?: string | null;
  placaVeiculo?: string | null;
  descricao?: string | null;
};

export type EditarBemRequest = Partial<CriarBemRequest>;

export type BemMidiaResponse = {
  id: string;
  tipo: string;
  arquivo: string;
  ordem: number;
  /** GET pré-assinado (campo `arquivoUrl` no Java). */
  arquivoUrl?: string | null;
  /** Compatibilidade se algum endpoint enviar `url`. */
  url?: string | null;
  createdAt?: string | null;
};

export type BemResponse = {
  id: string;
  modelo: string;
  marca: string | { nome?: string };
  tipoVeiculo: string;
  condicao: string;
  ano: number;
  quilometragem?: number | null;
  finalChassi?: string | null;
  combustivel: string;
  cambio: string;
  blindado: boolean;
  cor?: string | null;
  placaVeiculo?: string | null;
  descricao?: string | null;
  status: StatusBem;
  midias?: BemMidiaResponse[];
};

export type BemResumoResponse = {
  id: string;
  modelo: string;
  marca: string | { nome?: string };
  tipoVeiculo: string;
  condicao?: string;
  ano: number;
  status: StatusBem;
  /** Mídias com URL de leitura (ex.: GET pré-assinado no R2). */
  midias?: BemMidiaResponse[];
  placaVeiculo?: string | null;
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type GerarUploadBemMidiaRequest = {
  contentType: string;
  nomeArquivo: string;
  tipo: string;
};

export type UploadBemMidiaResponse = {
  objectKey: string;
  uploadUrl: string;
  expiresInSeconds: number;
};

export type ConfirmarUploadBemMidiaRequest = {
  objectKey: string;
  tipo: string;
  ordem?: number | null;
};
