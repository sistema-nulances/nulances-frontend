import { inferMarcaModelo } from "@/data/bem-marcas";
import { marketplaceAdminPendingModeration } from "@/data/marketplace-admin-mock";
import {
  marketplaceItems,
  type MarketplaceCategory,
  type MarketplaceItem,
} from "@/data/marketplace-items";

export type AnuncioModeracaoStatus = "aprovado" | "pendente" | "suspenso";

export type MarketplaceAnuncioTechDetails = {
  motorizacao: string;
  cilindrosCilindrada: string;
  potenciaCombinada: string;
  torqueCombinado: string;
  transmissao: string;
  tracao: string;
  modosConducao: string;
  carroceria: string;
  comprimentoLarguraAltura: string;
  entreEixos: string;
  portaMalas: string;
  tanqueCombustivel: string;
  ciclosUrbanoRodoviario: string;
  usoModoEletrico: string;
  emissoesSeloEficiencia: string;
  freiosDianteiros: string;
  freiosTraseiros: string;
  suspensaoDianteira: string;
  suspensaoTraseira: string;
  medidaPneus: string;
  estepe: string;
  airbags: string;
  absDistribuicao: string;
  controleEstabilidadeTracao: string;
  assistentePartidaRampa: string;
  cameraSensores: string;
  arCondicionadoClimatizador: string;
  direcao: string;
  bancosVolante: string;
  multimidiaConectividade: string;
  rodasIluminacao: string;
  vidrosTravas: string;
  procedenciaNuLances: string;
  licenciamentoDebitos: string;
  restricoesGravame: string;
  chavesManual: string;
  laudoCautelarInspecao: string;
};

export type MarketplaceAnuncioAdmin = Omit<MarketplaceItem, "id"> & {
  id: number | string;
  categoria?: string;
  vendedor: string;
  /** ISO 8601 */
  publicadoEm: string;
  fotos: string[];
  moderacao: AnuncioModeracaoStatus;
  /** Ficha técnica e mídia (alinhados ao cadastro de bem no leilão). */
  descricao?: string;
  tipoVeiculo?: string;
  placa?: string;
  blindado?: boolean;
  chassiFinal?: string;
  cor?: string;
  videoUrls?: string[];
  techDetails?: MarketplaceAnuncioTechDetails;
};

const PHOTO_POOL = [
  "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494976688153-c3ce8c4e1f90?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
];

const VENDEDORES = [
  "AutoMax DF",
  "João P. Souza",
  "Maria Helena Veículos",
  "Transportes Sul",
  "Premium Motors SP",
  "Loja do Zé Veículos",
  "CenterCar BH",
  "Sul Bikes",
];

/** Referência fixa para `publicadoEm` dos itens do catálogo (evita Date.now() na hidratação). */
const MOCK_PUBLICADO_ANCHOR_MS = Date.parse("2026-04-02T18:00:00.000Z");

function photosForId(seed: number, primary?: string): string[] {
  const a = primary || PHOTO_POOL[seed % PHOTO_POOL.length]!;
  const b = PHOTO_POOL[(seed * 3 + 1) % PHOTO_POOL.length]!;
  const c = PHOTO_POOL[(seed * 5 + 2) % PHOTO_POOL.length]!;
  return [a, b, c];
}

/** Semente estável para mocks quando `MarketplaceItem.id` é UUID (string). */
function seedFromMarketplaceItemId(id: MarketplaceItem["id"]): number {
  if (typeof id === "number" && Number.isFinite(id)) return id;
  let h = 0;
  const s = String(id);
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

const MOCK_VIDEO_SAMPLE =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const CORES_MOCK = ["Branca", "Prata", "Preta", "Vermelha", "Azul", "Cinza"] as const;

function mapCategoriaToTipoVeiculo(c: MarketplaceCategory): string {
  if (c === "motos") return "Moto";
  if (c === "caminhoes") return "Caminhão";
  return "Carro";
}

function mockPlacaMercosul(seed: number): string {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const nums = "0123456789";
  const pick = (s: string, i: number) => s[i % s.length]!;
  return `${pick(letters, seed)}${pick(letters, seed * 2)}${pick(letters, seed * 3)}${pick(nums, seed * 5)}${pick(letters, seed * 7)}${pick(nums, seed * 11)}${pick(nums, seed * 13)}`;
}

function mockChassiFinal(seed: number): string {
  return String(1000 + (seed % 9000)).padStart(4, "0");
}

export function defaultMarketplaceAnuncioTechDetails(params?: {
  combustivel?: string;
  cambio?: string;
}): MarketplaceAnuncioTechDetails {
  const combustivel = (params?.combustivel ?? "").toLowerCase();
  const cambio = params?.cambio?.trim() || "—";
  const hibrido = combustivel.includes("híbrido") || combustivel.includes("hybrid") || combustivel.includes("eletric");

  return {
    motorizacao: hibrido
      ? "Motor a combustão + motor elétrico (sistema híbrido)"
      : "Motor a combustão (conforme projeto da versão anunciada)",
    cilindrosCilindrada: "4 cilindros em linha (conforme projeto da versão)",
    potenciaCombinada: "Conforme tabela do fabricante para a versão",
    torqueCombinado: "Conforme tabela do fabricante",
    transmissao: "Automática / e-CVT (conforme versão)",
    tracao: "Dianteira",
    modosConducao: "Conforme equipamento de série (Eco, Sport, individual etc.)",
    carroceria: "Sedã / hatch / SUV / picape / utilitário (conforme anúncio)",
    comprimentoLarguraAltura: "Valores oficiais do fabricante para a geração",
    entreEixos: "Conforme manual técnico",
    portaMalas: "Capacidade nominal do fabricante",
    tanqueCombustivel: "Conforme manual",
    ciclosUrbanoRodoviario: "Valores Inmetro quando publicados para a geração",
    usoModoEletrico: hibrido
      ? "Autonomia varia conforme carga da bateria e percurso"
      : "Não aplicável ao perfil de motorização deste anúncio",
    emissoesSeloEficiencia: "Verificar ficha do fabricante e Inmetro",
    freiosDianteiros: "A disco ventilados (padrão típico — confirmar unidade)",
    freiosTraseiros: "A disco ou tambor (conforme geração)",
    suspensaoDianteira: "Independente",
    suspensaoTraseira: "Independente ou semi-independente (conforme projeto)",
    medidaPneus: "Conforme etiqueta da porta ou manual",
    estepe: "Temporário, run-flat ou ausente (conforme versão)",
    airbags: "Frontais; laterais e cortina conforme pacote",
    absDistribuicao: "De série na maioria das versões recentes",
    controleEstabilidadeTracao: "Se equipado de fábrica para o ano/modelo",
    assistentePartidaRampa: "Conforme opcionais da unidade",
    cameraSensores: "Conforme pacote multimídia",
    arCondicionadoClimatizador: "Digital ou analógico (conforme versão)",
    direcao: "Hidráulica ou elétrica",
    bancosVolante: "Ajustes manuais ou elétricos; revestimento conforme acabamento",
    multimidiaConectividade: "Central, Bluetooth, espelhamento (se de série)",
    rodasIluminacao: "Liga leve; faróis halógeno / LED / Full LED",
    vidrosTravas: "Elétricos com one-touch nos dianteiros (quando aplicável)",
    procedenciaNuLances: "Unidade vinculada ao ecossistema de leilão e marketplace",
    licenciamentoDebitos: "Checagem recomendada antes da transação",
    restricoesGravame: "Confirmar situação atual com o vendedor",
    chavesManual: "Confirmar entrega na negociação",
    laudoCautelarInspecao: "Solicite quando disponível",
  };
}

function itemToAdmin(item: MarketplaceItem, moderacao: AnuncioModeracaoStatus): MarketplaceAnuncioAdmin {
  const seed = seedFromMarketplaceItemId(item.id);
  const vendedor = VENDEDORES[seed % VENDEDORES.length]!;
  const daysAgo = seed % 45;
  const publicadoEm = new Date(MOCK_PUBLICADO_ANCHOR_MS - daysAgo * 86400000).toISOString();
  const id = item.id;
  return {
    ...item,
    vendedor,
    publicadoEm,
    fotos: photosForId(seed, item.imagem),
    moderacao,
    descricao: `Veículo com histórico de manutenção. Documentação em dia. Ref. mock #${id}.`,
    tipoVeiculo: mapCategoriaToTipoVeiculo(item.categoria),
    placa: mockPlacaMercosul(seed),
    blindado: seed % 7 === 0,
    chassiFinal: mockChassiFinal(seed * 17),
    cor: CORES_MOCK[seed % CORES_MOCK.length],
    videoUrls: seed % 4 === 0 ? [MOCK_VIDEO_SAMPLE] : undefined,
    techDetails: defaultMarketplaceAnuncioTechDetails({
      combustivel: item.combustivel,
      cambio: item.cambio,
    }),
  };
}

function pendingToAdmin(): MarketplaceAnuncioAdmin[] {
  return marketplaceAdminPendingModeration.map((p) => {
    const seed = p.id;
    const inf = inferMarcaModelo(p.titulo);
    const marca = inf.marca || "—";
    const modelo = inf.modelo || "—";
    return {
      id: p.id,
      leilaoId: 0,
      categoria: p.categoria,
      status: "EM_BREVE",
      titulo: p.titulo,
      condicao: "Média monta",
      marca,
      modelo,
      ano: "—",
      km: "—",
      cambio: "—",
      combustivel: "—",
      local: "A definir",
      preco: "Sob consulta",
      imagem: PHOTO_POOL[seed % PHOTO_POOL.length],
      vendedor: p.vendedor,
      publicadoEm: p.enviadoEm,
      fotos: photosForId(seed, PHOTO_POOL[seed % PHOTO_POOL.length]),
      moderacao: "pendente",
      descricao: "Anúncio aguardando revisão. Complete os dados após aprovação.",
      tipoVeiculo: mapCategoriaToTipoVeiculo(p.categoria),
      placa: mockPlacaMercosul(seed),
      blindado: false,
      chassiFinal: mockChassiFinal(seed * 3),
      cor: "—",
      videoUrls: undefined,
      techDetails: defaultMarketplaceAnuncioTechDetails({
        combustivel: p.categoria === "carros" ? "Flex" : "",
        cambio: "—",
      }),
    };
  });
}

/** IDs do catálogo que aparecem como suspensos no mock. */
const SUSPENDED_IDS = new Set<number>([103, 108]);

export function buildMarketplaceAnunciosAdminSeed(): MarketplaceAnuncioAdmin[] {
  const catalog = marketplaceItems.map((item) => {
    const moderacao: AnuncioModeracaoStatus =
      typeof item.id === "number" && SUSPENDED_IDS.has(item.id) ? "suspenso" : "aprovado";
    return itemToAdmin(item, moderacao);
  });
  const pending = pendingToAdmin();
  return [...pending, ...catalog].sort(
    (a, b) => new Date(b.publicadoEm).getTime() - new Date(a.publicadoEm).getTime()
  );
}

/** Filtro da lista no admin: todos ou um status de moderação. */
export type ModeracaoFiltro = "todos" | AnuncioModeracaoStatus;

export function filterAnunciosByModeracaoFiltro(
  list: MarketplaceAnuncioAdmin[],
  filtro: ModeracaoFiltro
): MarketplaceAnuncioAdmin[] {
  if (filtro === "todos") return list;
  return list.filter((a) => a.moderacao === filtro);
}

/** Texto para busca: minúsculas e sem acentos (compatível com nomes PT-BR). */
function normalizeSearchText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/**
 * Filtra anúncios pelo campo de busca (cliente).
 * Considera título, nome do vendedor, id e local. Várias palavras exigem que todas apareçam
 * em algum desses campos (ex.: "João Silva" encontra "João da Silva").
 */
export function filterAnunciosBySearch(list: MarketplaceAnuncioAdmin[], q: string): MarketplaceAnuncioAdmin[] {
  const raw = q.trim();
  if (!raw) return list;
  const tokens = raw
    .split(/\s+/)
    .map((t) => normalizeSearchText(t))
    .filter(Boolean);
  if (tokens.length === 0) return list;

  return list.filter((a) => {
    const haystack = normalizeSearchText(
      [a.titulo, a.vendedor, String(a.id), a.local].join(" ")
    );
    return tokens.every((t) => haystack.includes(t));
  });
}
