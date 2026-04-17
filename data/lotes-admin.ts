/**
 * Lote administrativo: conjunto de bens/itens que pode ser inserido em um leilão.
 * Não confundir com o evento (leilão) nem com um único veículo.
 *
 * Regra: um lote **disponível** pode ser vinculado a um leilão. Depois de vinculado
 * (`em_leilao` ou após encerramento `encerrado`), **não** pode ser adicionado a outro leilão.
 */
/** Metadado de mídia persistida (para remoção via API). */
export type LoteBemMidiaDetalhe = {
  id: string;
  url: string;
  kind: "image" | "video";
};

export type LoteBemItem = {
  id: string;
  nome: string;
  /** Modelo/versão (API); quando ausente, a UI deduz pelo nome. */
  modelo?: string;
  /** Código `MarcaVeiculo` (ex.: TOYOTA) quando vindo da API; texto legado nos mocks. */
  marca?: string;
  /** Ex.: tipo de bem, família (mantido em sync com tipo de veículo quando aplicável). */
  categoria?: string;
  descricao?: string;
  /** Tipo de veículo no cadastro do bem (código enum API ou legado). */
  tipoVeiculo?: string;
  /** Condição do bem (código enum API ou legado). */
  condicao?: string;
  ano?: string;
  quilometragem?: string;
  combustivel?: string;
  cambio?: string;
  /** Placa Mercosul ou antiga (apenas alfanuméricos na UI). */
  placa?: string;
  blindado?: boolean;
  /** Últimos caracteres do chassi (exibição). */
  chassiFinal?: string;
  cor?: string;
  /** URLs de fotos (ex.: object URLs na sessão ou futuras URLs remotas). */
  fotoUrls?: string[];
  /** URLs de vídeos. */
  videoUrls?: string[];
  /** Status do bem na API (`DISPONIVEL`, `EM_LOTE`, …). */
  statusBem?: string;
  /** Mídias já salvas no backend (id + URL pública). */
  midiasDetalhe?: LoteBemMidiaDetalhe[];
};

/** `disponivel` = pode ser incluído em um leilão. Demais = já utilizado em evento. */
export type LoteAdminStatus = "disponivel" | "em_leilao" | "encerrado";

export type LoteAdmin = {
  id: string;
  codigo: string;
  titulo: string;
  observacoes?: string;
  status: LoteAdminStatus;
  /** Preenchido quando o lote está ou esteve em um leilão. `null` se ainda disponível. */
  leilaoId: string | null;
  itens: LoteBemItem[];
};

/** Lotes que ainda podem ser vinculados a um (único) leilão. */
export function lotePodeVincularLeilao(l: LoteAdmin): boolean {
  return l.status === "disponivel";
}

export const LOTES_ADMIN_SEED: LoteAdmin[] = [
  {
    id: "lote-adm-001",
    codigo: "Lote 102",
    titulo: "Frota utilitários — região Centro-Oeste",
    status: "em_leilao",
    leilaoId: "lei-ev-cerrado-2025",
    observacoes: "Documentação conferida pelo comitente.",
    itens: [
      {
        id: "bem-adm-1",
        nome: "Toyota Hilux SRX 2.8 Diesel 4x4 AT",
        categoria: "Caminhonete",
        descricao: "Ano 2022/2023, diesel, recuperável.",
      },
      {
        id: "bem-adm-2",
        nome: "Ford Ranger XLT 3.2 4x4",
        categoria: "Caminhonete",
        descricao: "Ano 2021, revisões em dia.",
      },
    ],
  },
  {
    id: "lote-adm-002",
    codigo: "Lote 087",
    titulo: "Sedãs premium — seguradora",
    status: "em_leilao",
    leilaoId: "lei-seguradoras-go",
    itens: [
      {
        id: "bem-adm-3",
        nome: "Honda Civic Touring 1.5 Turbo CVT",
        categoria: "Carro",
        descricao: "Blindado nível III, único dono.",
      },
    ],
  },
  {
    id: "lote-adm-003",
    codigo: "Lote 201",
    titulo: "Pesados e máquinas — lote misto",
    status: "em_leilao",
    leilaoId: "lei-pesados-ms",
    itens: [
      {
        id: "bem-adm-4",
        nome: "Mercedes-Benz Atego 2426",
        categoria: "Caminhão",
      },
      {
        id: "bem-adm-5",
        nome: "Retroescavadeira Case 580N",
        categoria: "Máquina",
      },
      {
        id: "bem-adm-6",
        nome: "Gerador stemac 150 kVA",
        categoria: "Equipamento",
      },
    ],
  },
  {
    id: "lote-adm-004",
    codigo: "Lote 045",
    titulo: "Leves e SUVs — SP capital",
    status: "em_leilao",
    leilaoId: "lei-premium-sp-03",
    itens: [
      {
        id: "bem-adm-7",
        nome: "Toyota Corolla XEI 2.0",
        categoria: "Carro",
      },
      {
        id: "bem-adm-8",
        nome: "Jeep Compass Longitude T270",
        categoria: "SUV",
      },
    ],
  },
  {
    id: "lote-adm-005",
    codigo: "Lote M-12",
    titulo: "Motocicletas diversas",
    status: "em_leilao",
    leilaoId: "lei-moto-mixed",
    itens: [
      { id: "bem-adm-9", nome: "Honda CB 650F", categoria: "Moto" },
      { id: "bem-adm-10", nome: "Yamaha MT-07", categoria: "Moto" },
    ],
  },
  {
    id: "lote-adm-006",
    codigo: "Lote 330",
    titulo: "Caminhões — Sul",
    status: "em_leilao",
    leilaoId: "lei-sul-caminhoes",
    itens: [
      {
        id: "bem-adm-11",
        nome: "Volvo FH 540 6x2",
        categoria: "Caminhão",
      },
    ],
  },
  {
    id: "lote-adm-007",
    codigo: "Lote 501",
    titulo: "Judicial — frota variada (RJ)",
    status: "encerrado",
    leilaoId: "lei-jud-rj-01",
    itens: [
      {
        id: "bem-adm-12",
        nome: "Fiat Strada 1.3 Endurance",
        categoria: "Picape",
      },
      {
        id: "bem-adm-13",
        nome: "VW Gol 1.0",
        categoria: "Carro",
      },
    ],
  },
  {
    id: "lote-adm-008",
    codigo: "Lote 88",
    titulo: "Retomados — bancos (DF)",
    status: "encerrado",
    leilaoId: "lei-df-retomados",
    itens: [
      {
        id: "bem-adm-14",
        nome: "Toyota Yaris XLS Sedan",
        categoria: "Carro",
      },
    ],
  },
  {
    id: "lote-adm-009",
    codigo: "Lote 701",
    titulo: "Lote em cadastro — aguardando leilão",
    status: "disponivel",
    leilaoId: null,
    observacoes: "Bens já catalogados; evento a definir.",
    itens: [
      {
        id: "bem-adm-15",
        nome: "Hyundai HB20S 1.0 TGDI",
        categoria: "Carro",
      },
      {
        id: "bem-adm-16",
        nome: "Nissan Kicks Advance",
        categoria: "SUV",
      },
    ],
  },
  {
    id: "lote-adm-010",
    codigo: "Lote 902",
    titulo: "Seminovos — frota locadora",
    status: "disponivel",
    leilaoId: null,
    itens: [
      {
        id: "bem-adm-17",
        nome: "Chevrolet Onix Plus 1.0 LTZ",
        categoria: "Carro",
      },
    ],
  },
  {
    id: "lote-adm-011",
    codigo: "Lote 903",
    titulo: "Equipamentos diversos (sem veículo)",
    status: "disponivel",
    leilaoId: null,
    itens: [
      {
        id: "bem-adm-18",
        nome: "Empilhadeira elétrica 2,5 t",
        categoria: "Equipamento",
      },
      {
        id: "bem-adm-19",
        nome: "Container 20 pés",
        categoria: "Outros",
      },
    ],
  },
];
