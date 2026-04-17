export type TipoPessoaVendedorApi = "PESSOA_FISICA" | "PESSOA_JURIDICA";

export type StatusSolicitacaoVendedorApi = "PENDENTE" | "APROVADA" | "RECUSADA";

export type TipoDocumentoSolicitacaoVendedorApi =
  | "RG_FRENTE"
  | "RG_VERSO"
  | "CPF_FRENTE"
  | "CPF_VERSO"
  | "SELFIE_COM_DOCUMENTO"
  | "CONTRATO_SOCIAL";

export type GerarUploadDocumentoVendedorRequest = {
  contentType: string;
  nomeArquivo: string;
  tipoDocumento: TipoDocumentoSolicitacaoVendedorApi;
};

export type UploadDocumentoVendedorResponse = {
  uploadUrl: string;
  objectKey: string;
  fileUrl?: string;
  expiresInSeconds: number;
};

export type SolicitarAcessoVendedorRequest = {
  tipoPessoa: TipoPessoaVendedorApi;
  cpf?: string | null;
  cnpj?: string | null;
  nomeCompleto?: string | null;
  razaoSocial?: string | null;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  informacoesNegocio: string;
  rgFrenteKey?: string | null;
  rgVersoKey?: string | null;
  cpfFrenteKey?: string | null;
  cpfVersoKey?: string | null;
  selfieComDocumentoKey?: string | null;
  contratoSocialKey?: string | null;
};

export type DocumentoSolicitacaoVendedorResponse = {
  tipo?: TipoDocumentoSolicitacaoVendedorApi | string;
  arquivo?: string;
  arquivoUrl?: string;
  [key: string]: unknown;
};

export type SolicitacaoVendedorResponse = {
  id?: string;
  tipoPessoa?: TipoPessoaVendedorApi | string;
  status?: StatusSolicitacaoVendedorApi | string;
  cpf?: string | null;
  cnpj?: string | null;
  nomeCompleto?: string | null;
  razaoSocial?: string | null;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  informacoesNegocio?: string;
  observacaoAdmin?: string | null;
  documentos?: DocumentoSolicitacaoVendedorResponse[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};
