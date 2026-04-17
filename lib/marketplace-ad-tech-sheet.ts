import type { AuctionItem } from "@/data/auction-items";
import type { MarketplaceItem } from "@/data/marketplace-items";
import type { AnuncioPublicoDetalheTecnicoResponse } from "@/lib/repositories/types/marketplace-public.types";

export type TechSheetRow = { label: string; value: string };
export type TechSheetSection = { title: string; rows: TechSheetRow[] };

function detailOrDash(value: string | null | undefined): string {
  const v = String(value ?? "").trim();
  return v || "—";
}

function safeYearFromAno(ano: string) {
  const [fab, mod] = ano.split("/");
  return { fab: fab?.trim() || "—", mod: mod?.trim() || "—" };
}

function motorTemplate(
  combustivel: string,
  categoria: string,
): { linhas: TechSheetRow[] } {
  const c = combustivel.toLowerCase();
  const cat = categoria.toLowerCase();

  if (cat.includes("moto")) {
    return {
      linhas: [
        { label: "Cilindrada", value: "Consulte versão / manual do proprietário" },
        { label: "Potência (cv)", value: "Conforme tabela do fabricante" },
        { label: "Torque", value: "Conforme tabela do fabricante" },
        { label: "Refrigeração", value: "Líquida" },
        { label: "Alimentação", value: c.includes("flex") ? "Injeção eletrônica flex" : "Injeção eletrônica" },
        { label: "Partida", value: "Elétrica" },
        { label: "Tração", value: "Traseira por corrente ou cardã (conforme modelo)" },
      ],
    };
  }

  if (cat.includes("caminh") || cat.includes("caminhonete")) {
    return {
      linhas: [
        { label: "Motor", value: "Conforme placa do motor e documentação" },
        { label: "Potência (cv)", value: "Conforme manual / fabricante" },
        { label: "Torque", value: "Conforme manual / fabricante" },
        { label: "Tração", value: categoria.includes("4x4") || c.includes("4x4") ? "4x4" : "4x2 / conforme versão" },
        { label: "Turbo / aspiração", value: "Conforme versão anunciada" },
      ],
    };
  }

  if (c.includes("híbrid") || c.includes("hybrid")) {
    return {
      linhas: [
        { label: "Motorização", value: "Motor a combustão + motor elétrico (sistema híbrido)" },
        { label: "Cilindros / cilindrada", value: "4 cilindros em linha (conforme projeto da versão)" },
        { label: "Potência combinada (cv)", value: "Conforme tabela do fabricante para a versão" },
        { label: "Torque combinado", value: "Conforme tabela do fabricante" },
        { label: "Transmissão", value: "Automática / e-CVT (conforme versão)" },
        { label: "Tração", value: "Dianteira" },
      ],
    };
  }

  if (c.includes("diesel")) {
    return {
      linhas: [
        { label: "Motor", value: "Diesel turbo (conforme versão)" },
        { label: "Potência (cv)", value: "Conforme manual do proprietário" },
        { label: "Torque", value: "Conforme manual do proprietário" },
        { label: "Alimentação", value: "Injeção direta / common rail (conforme geração)" },
        { label: "Tração", value: "Conforme versão (4x2 / 4x4)" },
      ],
    };
  }

  return {
    linhas: [
      { label: "Motor", value: "Flex / gasolina (conforme versão e documento)" },
      { label: "Cilindros", value: "Conforme projeto do veículo" },
      { label: "Potência (cv)", value: "Conforme tabela do fabricante" },
      { label: "Torque", value: "Conforme tabela do fabricante" },
      { label: "Alimentação", value: "Injeção eletrônica multiponto" },
      { label: "Tração", value: "Dianteira" },
    ],
  };
}

function dimensoesTemplate(categoria: string): TechSheetRow[] {
  const cat = categoria.toLowerCase();
  if (cat.includes("moto")) {
    return [
      { label: "Comprimento", value: "Conforme fabricante" },
      { label: "Largura / entre-eixos", value: "Conforme fabricante" },
      { label: "Altura do banco", value: "Conforme fabricante" },
      { label: "Peso seco / ordenado", value: "Conforme documentação" },
      { label: "Capacidade do tanque", value: "Conforme manual" },
    ];
  }
  if (cat.includes("caminh")) {
    return [
      { label: "Comprimento total", value: "Conforme carroceria / documento" },
      { label: "Entre-eixos", value: "Conforme documentação do veículo" },
      { label: "Altura livre / PBT", value: "Verificar documentação e licenciamento" },
      { label: "Capacidade de carga", value: "Conforme CRLV e projeto" },
      { label: "Tanque de combustível", value: "Conforme fabricante" },
    ];
  }
  return [
    { label: "Carroceria", value: "Sedã / hatch / SUV / picape / utilitário (conforme anúncio)" },
    { label: "Comprimento / largura / altura", value: "Valores oficiais do fabricante para a geração" },
    { label: "Entre-eixos", value: "Conforme manual técnico" },
    { label: "Porta-malas", value: "Capacidade nominal do fabricante" },
    { label: "Tanque de combustível", value: "Conforme manual" },
  ];
}

function categoriaLegivel(m: MarketplaceItem, auction?: AuctionItem): string {
  if (auction?.categoria) return auction.categoria;
  if (m.categoria === "carros") return "Carro";
  if (m.categoria === "motos") return "Moto";
  return "Caminhão";
}

/** Ficha técnica detalhada: mescla dados do anúncio com campos típicos de manual / mercado. */
export function buildMarketplaceTechSheet(
  auction: AuctionItem | undefined,
  marketplace: MarketplaceItem,
  detalheTecnico?: AnuncioPublicoDetalheTecnicoResponse | null,
): TechSheetSection[] {
  const categoria = categoriaLegivel(marketplace, auction);
  const marca = auction?.marca ?? marketplace.marca;
  const modelo = marketplace.modelo;
  const versao = auction?.versao ?? marketplace.titulo;
  const combustivel = auction?.combustivel ?? marketplace.combustivel;
  const cambio = auction?.cambio ?? marketplace.cambio;
  const cor = auction?.cor ?? "—";
  const km = auction?.km ?? marketplace.km;
  const { fab, mod } = safeYearFromAno(marketplace.ano);
  const anoFab = auction?.anoFabricacao ?? fab;
  const anoMod = auction?.anoModelo ?? mod;
  const dt = detalheTecnico ?? undefined;

  const identificacao: TechSheetRow[] = [
    { label: "Marca", value: marca },
    { label: "Modelo", value: modelo },
    { label: "Versão / acabamento", value: versao },
    { label: "Categoria", value: categoria },
    { label: "Ano fabricação", value: anoFab },
    { label: "Ano modelo", value: anoMod },
    { label: "Quilometragem declarada", value: km },
    { label: "Cor predominante", value: cor },
    { label: "Combustível", value: combustivel },
    { label: "Câmbio", value: cambio },
    { label: "Condição informada", value: marketplace.condicao },
    { label: "Localização do anúncio", value: marketplace.local },
  ];

  const motorTransmissao: TechSheetRow[] = [
    { label: "Motorização", value: detailOrDash(dt?.motorizacao) },
    { label: "Cilindros", value: detailOrDash(dt?.cilindros) },
    { label: "Potência combinada", value: detailOrDash(dt?.potenciaCombinada) },
    { label: "Torque combinado", value: detailOrDash(dt?.torqueCombinado) },
    { label: "Transmissão", value: detailOrDash(dt?.transmissao) },
    { label: "Tração", value: detailOrDash(dt?.tracao) },
    { label: "Modos de condução", value: detailOrDash(dt?.modosConducao) },
  ];

  const dimensoesCapacidades: TechSheetRow[] = [
    { label: "Carroceria", value: detailOrDash(dt?.carroceria) },
    { label: "Comprimento / largura / altura", value: detailOrDash(dt?.comprimentoLarguraAltura) },
    { label: "Entre-eixos", value: detailOrDash(dt?.entreEixos) },
    { label: "Porta-malas", value: detailOrDash(dt?.portaMalas) },
    { label: "Tanque de combustível", value: detailOrDash(dt?.tanqueCombustivel) },
  ];

  const consumo: TechSheetRow[] = [
    { label: "Ciclos urbano", value: detailOrDash(dt?.ciclosUrbano) },
    { label: "Uso modo elétrico", value: detailOrDash(dt?.usoModoEletrico) },
    { label: "Emissões / selo de eficiência", value: detailOrDash(dt?.emissoesSeloEficiencia) },
  ];

  const freiosSusp: TechSheetRow[] = [
    { label: "Freios dianteiros", value: detailOrDash(dt?.freiosDianteiros) },
    { label: "Suspensão dianteira", value: detailOrDash(dt?.suspensaoDianteira) },
    { label: "Suspensão traseira", value: detailOrDash(dt?.suspensaoTraseira) },
    { label: "Medida dos pneus", value: detailOrDash(dt?.medidaPneus) },
    { label: "Estepe", value: detailOrDash(dt?.estepe) },
  ];

  const seguranca: TechSheetRow[] = [
    { label: "Airbags", value: detailOrDash(dt?.airbags) },
    { label: "ABS e distribuição eletrônica", value: detailOrDash(dt?.absDistribuicaoEletronica) },
    { label: "Controle de estabilidade e tração", value: detailOrDash(dt?.controleEstabilidadeTracao) },
    { label: "Assistente de partida em rampa", value: detailOrDash(dt?.assistentePartidaRampa) },
    { label: "Câmera / sensores de estacionamento", value: detailOrDash(dt?.cameraSensoresEstacionamento) },
  ];

  const conforto: TechSheetRow[] = [
    { label: "Ar-condicionado / climatizador", value: detailOrDash(dt?.arCondicionadoClimatizador) },
    { label: "Direção", value: detailOrDash(dt?.direcao) },
    { label: "Bancos e volante", value: detailOrDash(dt?.bancosVolante) },
    { label: "Multimídia e conectividade", value: detailOrDash(dt?.multimidiaConectividade) },
    { label: "Rodas e iluminação", value: detailOrDash(dt?.rodasIluminacao) },
    { label: "Vidros e travas", value: detailOrDash(dt?.vidrosTravas) },
  ];

  const doc: TechSheetRow[] = [
    { label: "Procedência NuLances", value: detailOrDash(dt?.procedenciaNulances) },
    { label: "Licenciamento e débitos", value: detailOrDash(dt?.licenciamentoDebitos) },
    { label: "Restrições / gravame", value: detailOrDash(dt?.restricoesGravame) },
    { label: "Chaves e manual", value: detailOrDash(dt?.chavesManual) },
    { label: "Laudo cautelar / inspeção", value: detailOrDash(dt?.laudoCautelarInspecao) },
  ];

  return [
    { title: "Identificação e dados do anúncio", rows: identificacao },
    { title: "Motor, performance e transmissão", rows: motorTransmissao },
    { title: "Dimensões, capacidades e carroceria", rows: dimensoesCapacidades },
    { title: "Consumo, eficiência e emissões", rows: consumo },
    { title: "Freios, suspensão e pneus", rows: freiosSusp },
    { title: "Segurança e assistência à condução", rows: seguranca },
    { title: "Conforto, acabamento e tecnologia", rows: conforto },
    { title: "Documentação e procedência", rows: doc },
  ];
}
