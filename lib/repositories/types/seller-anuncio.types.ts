export type TipoMidiaAnuncioApi = "FOTO" | "VIDEO";

export type CategoriaAnuncioApi =
  | "IMOVEIS"
  | "CELULARES_E_TELEFONIA"
  | "CASA_DECORACAO_E_UTENSILIOS"
  | "ESPORTES_E_FITNESS"
  | "SERVICOS"
  | "MODA_E_BELEZA"
  | "ARTIGOS_INFANTIS"
  | "ANIMAIS_DE_ESTIMACAO"
  | "MUSICA_E_HOBBIES"
  | "AGRO_E_INDUSTRIA"
  | "VAGAS_DE_EMPREGO"
  | "COMERCIO"
  | "GAMES"
  | "TVS_E_VIDEO"
  | "AUDIO"
  | "INFORMATICA"
  | "ELETRO"
  | "MOVEIS"
  | "MATERIAIS_DE_CONSTRUCAO"
  | "ESCRITORIO_E_HOME_OFFICE";

export type TipoVeiculoAnuncioApi =
  | "CARRO"
  | "MOTO"
  | "CAMINHAO"
  | "SUV"
  | "CAMINHONETE"
  | "ONIBUS"
  | "OUTRO";

export type CondicaoAnuncioVeiculoApi =
  | "MEDIA_MONTA"
  | "PEQUENA_MONTA"
  | "GRANDE_MONTA";

export type CombustivelVeiculoApi =
  | "FLEX"
  | "DIESEL"
  | "GASOLINA"
  | "ETANOL"
  | "ELETRICO"
  | "HIBRIDO";

export type CambioVeiculoApi = "AUTOMATICO" | "MANUAL" | "CVT" | "AUTOMATIZADO";

export type GerarUploadMidiaAnuncioRequest = {
  nomeArquivo: string;
  contentType: string;
  tipo: TipoMidiaAnuncioApi;
};

export type UploadMidiaAnuncioResponse = {
  uploadUrl: string;
  objectKey: string;
  fileUrl: string;
  expiresInSeconds: number;
};

export type AnuncioMidiaRequest = {
  tipo: TipoMidiaAnuncioApi;
  arquivo: string;
  ordem: number;
};

export type AnuncioDetalheTecnicoRequest = {
  motorizacao?: string;
  cilindros?: string;
  potenciaCombinada?: string;
  torqueCombinado?: string;
  transmissao?: string;
  tracao?: string;
  modosConducao?: string;
  carroceria?: string;
  comprimentoLarguraAltura?: string;
  entreEixos?: string;
  portaMalas?: string;
  tanqueCombustivel?: string;
  ciclosUrbano?: string;
  usoModoEletrico?: string;
  emissoesSeloEficiencia?: string;
  freiosDianteiros?: string;
  suspensaoDianteira?: string;
  suspensaoTraseira?: string;
  medidaPneus?: string;
  estepe?: string;
  airbags?: string;
  absDistribuicaoEletronica?: string;
  controleEstabilidadeTracao?: string;
  assistentePartidaRampa?: string;
  cameraSensoresEstacionamento?: string;
  arCondicionadoClimatizador?: string;
  direcao?: string;
  bancosVolante?: string;
  multimidiaConectividade?: string;
  rodasIluminacao?: string;
  vidrosTravas?: string;
  procedenciaNulances?: string;
  licenciamentoDebitos?: string;
  restricoesGravame?: string;
  chavesManual?: string;
  laudoCautelarInspecao?: string;
};

/** PATCH: strings preenchidas ou `null` para limpar o campo na API (não use `undefined` nos valores). */
export type EditarAnuncioDetalheTecnicoRequest = Partial<{
  [K in keyof AnuncioDetalheTecnicoRequest]: string | null;
}>;

export type CriarAnuncioRequest = {
  categoria: CategoriaAnuncioApi;
  marca: string;
  modelo: string;
  preco: number;
  cidade: string;
  tipo?: TipoVeiculoAnuncioApi;
  condicao?: CondicaoAnuncioVeiculoApi;
  ano?: number;
  quilometragem?: number;
  combustivel?: CombustivelVeiculoApi;
  cambio?: CambioVeiculoApi;
  finalChassi?: string;
  cor?: string;
  blindado?: boolean;
  placaVeiculo?: string;
  descricao: string;
  detalheTecnico?: AnuncioDetalheTecnicoRequest;
  midias: AnuncioMidiaRequest[];
};

export type EditarAnuncioRequest = {
  categoria?: CategoriaAnuncioApi;
  marca?: string;
  modelo?: string;
  preco?: number;
  cidade?: string;
  tipo?: TipoVeiculoAnuncioApi;
  condicao?: CondicaoAnuncioVeiculoApi;
  ano?: number;
  quilometragem?: number;
  combustivel?: CombustivelVeiculoApi;
  cambio?: CambioVeiculoApi;
  finalChassi?: string;
  cor?: string;
  blindado?: boolean;
  placaVeiculo?: string;
  descricao?: string;
  detalheTecnico?: EditarAnuncioDetalheTecnicoRequest;
  /** Novas mídias para anexar ao anúncio existente (não remove mídias antigas). */
  midiasAdicionar?: AnuncioMidiaRequest[];
};

export type AnuncioDetalheTecnicoResponse = {
  motorizacao?: string;
  cilindros?: string;
  potenciaCombinada?: string;
  torqueCombinado?: string;
  transmissao?: string;
  tracao?: string;
  modosConducao?: string;
  carroceria?: string;
  comprimentoLarguraAltura?: string;
  entreEixos?: string;
  portaMalas?: string;
  tanqueCombustivel?: string;
  ciclosUrbano?: string;
  usoModoEletrico?: string;
  emissoesSeloEficiencia?: string;
  freiosDianteiros?: string;
  suspensaoDianteira?: string;
  suspensaoTraseira?: string;
  medidaPneus?: string;
  estepe?: string;
  airbags?: string;
  absDistribuicaoEletronica?: string;
  controleEstabilidadeTracao?: string;
  assistentePartidaRampa?: string;
  cameraSensoresEstacionamento?: string;
  arCondicionadoClimatizador?: string;
  direcao?: string;
  bancosVolante?: string;
  multimidiaConectividade?: string;
  rodasIluminacao?: string;
  vidrosTravas?: string;
  procedenciaNulances?: string;
  licenciamentoDebitos?: string;
  restricoesGravame?: string;
  chavesManual?: string;
  laudoCautelarInspecao?: string;
};

export type AnuncioMidiaResponse = {
  id?: string;
  tipo?: string;
  arquivo?: string;
  arquivoUrl?: string;
  url?: string;
  ordem?: number;
};

export type AnuncioResponse = {
  id: string;
  vendedorId: string;
  vendedorNome: string;
  categoria?: CategoriaAnuncioApi | null;
  marcaId?: string;
  marca: string;
  modelo: string;
  preco: number;
  cidade: string;
  tipo: string;
  condicao: string;
  ano: number;
  quilometragem?: number | null;
  combustivel: string;
  cambio: string;
  finalChassi?: string | null;
  cor?: string | null;
  blindado?: boolean | null;
  placaVeiculo?: string | null;
  descricao: string;
  status: string;
  createdAt?: string;
  criadoEm?: string;
  midias?: AnuncioMidiaResponse[];
  detalheTecnico?: AnuncioDetalheTecnicoResponse;
};

export type StatusAnuncioApi =
  | "PENDENTE"
  | "PUBLICADO"
  | "SUSPENSO"
  | "REPROVADO"
  | "CANCELADO"
  | (string & {});

export type SuspenderMeuAnuncioRequest = {
  motivo?: string;
};

export type AnuncioStatusResponse = {
  id?: string;
  status?: StatusAnuncioApi | null;
  mensagem?: string;
  motivo?: string | null;
  atualizadoEm?: string;
};

export type AnuncioMidiaListResponse = {
  id?: string;
  tipo?: TipoMidiaAnuncioApi | string;
  arquivo?: string;
  url?: string;
  ordem?: number;
};

export type AnuncioVendedorListResponse = {
  id: string;
  categoria?: CategoriaAnuncioApi | null;
  modelo?: string | null;
  marcaVeiculo?: string | null;
  quandoFoiPostado?: string | null;
  valor?: number | null;
  status?: StatusAnuncioApi | null;
  midias?: AnuncioMidiaListResponse[] | null;
};

export type ListarMeusAnunciosRequest = {
  busca?: string;
  status?: StatusAnuncioApi;
  page?: number;
  size?: number;
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};
