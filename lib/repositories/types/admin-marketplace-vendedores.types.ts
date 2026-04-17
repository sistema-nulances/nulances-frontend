export type StatusContaMarketplaceAdminApi = "TODOS" | "ATIVO" | "PENDENTE";

export type AdminMarketplaceVendedorListItemResponse = {
  id?: string;
  usuarioId?: string;
  nomeExibicao?: string;
  cpfOuCnpj?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
  fotoPerfil?: string;
  fotoPerfilUrl?: string;
  tipoRegistro?: string;
  statusConta?: string;
  dataSolicitacao?: string | null;
  dataAprovacao?: string | null;
  totalAnuncios?: number | null;
  totalPublicados?: number | null;
};

export type AdminMarketplaceDocumentoPendenteResponse = {
  tipo?: string;
  arquivo?: string;
  urlAssinada?: string;
};

export type RecusarSolicitacaoVendedorRequest = {
  observacao: string;
};

export type AdminMarketplaceSolicitacaoPendenteDetalheResponse = {
  solicitacaoId?: string;
  usuarioId?: string;
  tipoPessoa?: string;
  nomeExibicao?: string;
  cpfOuCnpj?: string;
  email?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
  informacoesNegocio?: string;
  fotoPerfil?: string;
  fotoPerfilUrl?: string;
  createdAt?: string;
  documentos?: AdminMarketplaceDocumentoPendenteResponse[];
};
