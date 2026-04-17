import type { AuctionStatus } from "@/data/auction-items";

/** Leilão com pregão presencial ou apenas online. */
export type LeilaoModalidade = "online" | "presencial";

/** Agenda de cada bem vinculado ao evento (horários de disputa). */
export type LeilaoAgendaBem = {
  auctionItemId: number;
  aberturaIso: string;
  encerramentoIso: string;
  /** Lance mínimo entre ofertas (R$), definido pelo admin ao montar a pauta. */
  incrementoMinimo: number;
};

/** Evento de leilão (catálogo administrativo), não confundir com lote/item. */
export type LeilaoAdmin = {
  id: string;
  titulo: string;
  /** Cidade (presencial) ou texto fixo tipo "Online" quando `modalidade` é online. */
  local: string;
  /** Padrão `presencial` quando ausente (seeds antigos). */
  modalidade?: LeilaoModalidade;
  dataAbertura: string;
  dataEncerramento: string;
  status: AuctionStatus;
  leiloeiroNome: string;
  /** Comitente principal do evento (cadastro admin). */
  comitenteId?: string;
  comitenteNome?: string;
  totalLotes: number;
  /** Lotes com leilão em andamento (status ABERTO no catálogo de lotes). */
  lotesAoVivo: number;
  /** Total de lances consolidados no evento (painel real). */
  totalLances?: number;
  /**
   * Se true, um bem por vez na pauta (próximo só após encerrar o anterior no fluxo).
   * Se false, vários bens podem disputar ao mesmo tempo, cada um com seu prazo.
   */
  pautaSequencial?: boolean;
  /** Opcional: bens do catálogo com janela de abertura/encerramento (painel / persistência futura). */
  agendaBens?: LeilaoAgendaBem[];
};

export const LEILOES_ADMIN_SEED: LeilaoAdmin[] = [
  {
    id: "lei-ev-cerrado-2025",
    titulo: "Veículos — Centro-Oeste II",
    modalidade: "presencial",
    local: "Cuiabá - MT",
    dataAbertura: "Hoje às 09:00",
    dataEncerramento: "Hoje às 21:00",
    status: "ABERTO",
    leiloeiroNome: "Ana Paula Ferreira",
    totalLotes: 48,
    lotesAoVivo: 12,
    pautaSequencial: true,
  },
  {
    id: "lei-premium-sp-03",
    titulo: "Premium Leves — São Paulo",
    modalidade: "presencial",
    local: "São Paulo - SP",
    dataAbertura: "Hoje às 14:00",
    dataEncerramento: "Hoje às 23:59",
    status: "ABERTO",
    leiloeiroNome: "Ana Paula Ferreira",
    totalLotes: 120,
    lotesAoVivo: 44,
    pautaSequencial: true,
  },
  {
    id: "lei-seguradoras-go",
    titulo: "Sinistros — Seguradoras",
    local: "Goiânia - GO",
    dataAbertura: "Amanhã às 10:00",
    dataEncerramento: "Amanhã às 18:00",
    status: "EM_BREVE",
    leiloeiroNome: "Juliana Costa",
    totalLotes: 64,
    lotesAoVivo: 0,
  },
  {
    id: "lei-pesados-ms",
    titulo: "Pesados & máquinas",
    local: "Campo Grande - MS",
    dataAbertura: "Sex. às 08:00",
    dataEncerramento: "Sex. às 17:00",
    status: "EM_BREVE",
    leiloeiroNome: "Juliana Costa",
    totalLotes: 22,
    lotesAoVivo: 0,
  },
  {
    id: "lei-jud-rj-01",
    titulo: "Judicial — Frota variada",
    local: "Rio de Janeiro - RJ",
    dataAbertura: "12/03 às 11:00",
    dataEncerramento: "12/03 às 19:00",
    status: "ENCERRADO",
    leiloeiroNome: "Carlos Mendes Oliveira",
    totalLotes: 86,
    lotesAoVivo: 0,
  },
  {
    id: "lei-df-retomados",
    titulo: "Retomados — Bancos",
    local: "Brasília - DF",
    dataAbertura: "10/03 às 09:30",
    dataEncerramento: "10/03 às 20:00",
    status: "ENCERRADO",
    leiloeiroNome: "Roberto Almeida",
    totalLotes: 55,
    lotesAoVivo: 0,
  },
  {
    id: "lei-sul-caminhoes",
    titulo: "Caminhões — Região Sul",
    modalidade: "online",
    local: "Online",
    dataAbertura: "Amanhã às 13:00",
    dataEncerramento: "Sáb. às 14:00",
    status: "EM_BREVE",
    leiloeiroNome: "Patrícia Nunes",
    totalLotes: 31,
    lotesAoVivo: 0,
  },
  {
    id: "lei-moto-mixed",
    titulo: "Motos & utilitários",
    local: "Rondonópolis - MT",
    dataAbertura: "Hoje às 19:30",
    dataEncerramento: "Hoje às 22:00",
    status: "ABERTO",
    leiloeiroNome: "Ana Paula Ferreira",
    totalLotes: 74,
    lotesAoVivo: 8,
  },
];
