export type ListarAnunciosPublicosRequest = {
  /** Filtro por modelo (backend). */
  busca?: string;
  categoria?: string;
  tipo?: string;
  condicao?: string;
  combustivel?: string;
  cambio?: string;
  page?: number;
  size?: number;
};

export type AnuncioPublicoMidiaResponse = {
  tipo?: string | null;
  arquivo?: string | null;
  url?: string | null;
  ordem?: number | null;
};

export type AnuncioPublicoListResponse = {
  id: string;
  categoria?: string | null;
  modelo?: string | null;
  descricao?: string | null;
  marcaVeiculo?: string | null;
  preco?: number | null;
  cidade?: string | null;
  tipoVeiculo?: string | null;
  condicao?: string | null;
  ano?: number | null;
  quilometragem?: number | null;
  combustivel?: string | null;
  cambio?: string | null;
  imagens?: AnuncioPublicoMidiaResponse[] | null;
};

export type AnuncioPublicoVendedorResponse = {
  nome?: string | null;
  cidade?: string | null;
  fotoPerfil?: string | null;
  fotoPerfilUrl?: string | null;
  sobre?: string | null;
  telefoneContato?: string | null;
};

export type AnuncioPublicoDetalheTecnicoResponse = {
  motorizacao?: string | null;
  cilindros?: string | null;
  potenciaCombinada?: string | null;
  torqueCombinado?: string | null;
  transmissao?: string | null;
  tracao?: string | null;
  modosConducao?: string | null;
  carroceria?: string | null;
  comprimentoLarguraAltura?: string | null;
  entreEixos?: string | null;
  portaMalas?: string | null;
  tanqueCombustivel?: string | null;
  ciclosUrbano?: string | null;
  usoModoEletrico?: string | null;
  emissoesSeloEficiencia?: string | null;
  freiosDianteiros?: string | null;
  suspensaoDianteira?: string | null;
  suspensaoTraseira?: string | null;
  medidaPneus?: string | null;
  estepe?: string | null;
  airbags?: string | null;
  absDistribuicaoEletronica?: string | null;
  controleEstabilidadeTracao?: string | null;
  assistentePartidaRampa?: string | null;
  cameraSensoresEstacionamento?: string | null;
  arCondicionadoClimatizador?: string | null;
  direcao?: string | null;
  bancosVolante?: string | null;
  multimidiaConectividade?: string | null;
  rodasIluminacao?: string | null;
  vidrosTravas?: string | null;
  procedenciaNulances?: string | null;
  licenciamentoDebitos?: string | null;
  restricoesGravame?: string | null;
  chavesManual?: string | null;
  laudoCautelarInspecao?: string | null;
};

export type AnuncioPublicoDetalheResponse = {
  id: string;
  categoria?: string | null;
  marcaVeiculo?: string | null;
  modelo?: string | null;
  preco?: number | null;
  cidade?: string | null;
  tipoVeiculo?: string | null;
  blindado?: boolean | null;
  quilometragem?: number | null;
  ano?: number | null;
  cor?: string | null;
  combustivel?: string | null;
  cambio?: string | null;
  descricao?: string | null;
  condicao?: string | null;
  detalheTecnico?: AnuncioPublicoDetalheTecnicoResponse | null;
  vendedor?: AnuncioPublicoVendedorResponse | null;
  imagens?: AnuncioPublicoMidiaResponse[] | null;
};
