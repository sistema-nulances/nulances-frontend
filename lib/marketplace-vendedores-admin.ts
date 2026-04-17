import { buildMarketplaceAnunciosAdminSeed } from "@/lib/marketplace-anuncios-admin";

export type VendedorContaStatus = "ativo" | "inativo" | "pendente_verificacao";

export type VendedorDocEnvioStatus = "recebido" | "em_analise" | "validado";

export type VendedorDocumentoAnalise = {
  id: string;
  titulo: string;
  descricao: string;
  /** ISO 8601 */
  enviadoEm: string;
  status: VendedorDocEnvioStatus;
};

/** Dados extras enviados na solicitação de vendedor (mock — só preenchido para pedidos pendentes). */
export type VendedorPerfilAnalise = {
  tipoConta: "pessoa_juridica" | "pessoa_fisica";
  nomeFantasiaOuCompleto: string;
  nomeResponsavel?: string;
  descricaoNegocio: string;
  enderecoCompleto: string;
  site?: string;
  inscricaoEstadual?: string;
  documentos: VendedorDocumentoAnalise[];
  /** Nota interna mock para o analista. */
  notaInterna?: string;
};

export type MarketplaceVendedorAdmin = {
  id: number | string;
  usuarioId?: string;
  nome: string;
  fotoPerfil?: string;
  email: string;
  telefone: string;
  cidadeUf: string;
  /** CPF/CNPJ fictício para exibição no admin (mock). */
  documento: string;
  status: VendedorContaStatus;
  /** ISO 8601 */
  cadastroEm: string;
  anunciosTotal: number;
  anunciosPublicados: number;
  perfilAnalise?: VendedorPerfilAnalise;
};

function numericSeedFromId(id: number | string): number {
  if (typeof id === "number" && Number.isFinite(id)) return Math.abs(Math.floor(id));
  const text = String(id);
  let acc = 0;
  for (let i = 0; i < text.length; i += 1) {
    acc = (acc * 31 + text.charCodeAt(i)) % 1_000_000;
  }
  return acc || 1;
}

/** Mesmos nomes usados em `marketplace-anuncios-admin` (vendedor dos anúncios). */
const NOMES = [
  "AutoMax DF",
  "João P. Souza",
  "Maria Helena Veículos",
  "Transportes Sul",
  "Premium Motors SP",
  "Loja do Zé Veículos",
  "CenterCar BH",
  "Sul Bikes",
] as const;

const MOCK_CADASTRO_BASE_MS = Date.parse("2025-06-15T12:00:00.000Z");

const DETALHES: Record<
  string,
  { email: string; telefone: string; cidadeUf: string; documento: string }
> = {
  "AutoMax DF": {
    email: "contato@automax-df.mkt",
    telefone: "(61) 99999-1001",
    cidadeUf: "Brasília - DF",
    documento: "12.345.678/0001-90",
  },
  "João P. Souza": {
    email: "joao.souza@email.mkt",
    telefone: "(11) 98888-2200",
    cidadeUf: "São Paulo - SP",
    documento: "***.***.***-12",
  },
  "Maria Helena Veículos": {
    email: "contato@mariahelena.mkt",
    telefone: "(31) 97777-3303",
    cidadeUf: "Belo Horizonte - MG",
    documento: "98.765.432/0001-11",
  },
  "Transportes Sul": {
    email: "frota@transportessul.mkt",
    telefone: "(51) 96666-4404",
    cidadeUf: "Porto Alegre - RS",
    documento: "11.222.333/0001-44",
  },
  "Premium Motors SP": {
    email: "vendas@premiummotors.mkt",
    telefone: "(11) 95555-5505",
    cidadeUf: "São Paulo - SP",
    documento: "22.333.444/0001-55",
  },
  "Loja do Zé Veículos": {
    email: "ze.veiculos@email.mkt",
    telefone: "(85) 94444-6606",
    cidadeUf: "Fortaleza - CE",
    documento: "33.444.555/0001-66",
  },
  "CenterCar BH": {
    email: "contato@centercar-bh.mkt",
    telefone: "(31) 93333-7707",
    cidadeUf: "Belo Horizonte - MG",
    documento: "44.555.666/0001-77",
  },
  "Sul Bikes": {
    email: "vendas@sulbikes.mkt",
    telefone: "(51) 92222-8808",
    cidadeUf: "Caxias do Sul - RS",
    documento: "55.666.777/0001-88",
  },
};

function aggregateAnunciosPorVendedor(): Map<string, { total: number; publicados: number }> {
  const rows = buildMarketplaceAnunciosAdminSeed();
  const map = new Map<string, { total: number; publicados: number }>();
  for (const a of rows) {
    const cur = map.get(a.vendedor) ?? { total: 0, publicados: 0 };
    cur.total += 1;
    if (a.moderacao === "aprovado") cur.publicados += 1;
    map.set(a.vendedor, cur);
  }
  return map;
}

function statusForIndex(i: number): VendedorContaStatus {
  if (i === 3 || i === 5) return "pendente_verificacao";
  if (i === 6) return "inativo";
  return "ativo";
}

function isNomePessoaJuridica(nome: string): boolean {
  const n = nome.toLowerCase();
  return (
    n.includes("veículos") ||
    n.includes("veiculos") ||
    n.includes("motors") ||
    n.includes("transportes") ||
    n.includes("bikes") ||
    n.includes("centercar") ||
    n.includes("automax")
  );
}

/** Mock de perfil + documentos para análise de pedido de vendedor. */
export function buildPerfilAnaliseMock(
  v: Pick<MarketplaceVendedorAdmin, "id" | "nome" | "email" | "telefone" | "cidadeUf" | "documento" | "cadastroEm">
): VendedorPerfilAnalise {
  const pj = isNomePessoaJuridica(v.nome);
  const idSeed = numericSeedFromId(v.id);
  const baseDocMs = Date.parse(v.cadastroEm);
  const docIso = (offsetHoras: number) => new Date(baseDocMs + offsetHoras * 3600000).toISOString();

  const documentos: VendedorDocumentoAnalise[] = pj
    ? [
        {
          id: "cnpj",
          titulo: "Cartão CNPJ / contrato social",
          descricao: "PDF consolidado (primeiras páginas legíveis).",
          enviadoEm: docIso(-48),
          status: "validado",
        },
        {
          id: "end",
          titulo: "Comprovante de endereço da sede",
          descricao: "Conta de luz ou contrato de locação em nome da empresa.",
          enviadoEm: docIso(-24),
          status: "em_analise",
        },
        {
          id: "resp",
          titulo: "RG/CNH do representante legal",
          descricao: "Documento com foto e CPF legível.",
          enviadoEm: docIso(-6),
          status: "recebido",
        },
        {
          id: "kyc",
          titulo: "Selfie com documento (KYC)",
          descricao: "Foto segurando documento ao lado do rosto.",
          enviadoEm: docIso(-2),
          status: "recebido",
        },
      ]
    : [
        {
          id: "rg",
          titulo: "RG ou CNH",
          descricao: "Frente e verso em um único arquivo.",
          enviadoEm: docIso(-48),
          status: "validado",
        },
        {
          id: "end",
          titulo: "Comprovante de residência",
          descricao: "Últimos 90 dias.",
          enviadoEm: docIso(-24),
          status: "em_analise",
        },
        {
          id: "kyc",
          titulo: "Selfie com documento",
          descricao: "Validação facial (mock).",
          enviadoEm: docIso(-4),
          status: "recebido",
        },
      ];

  const endereco =
    pj
      ? `Av. Exemplo, ${1000 + idSeed * 11} — ${v.cidadeUf} · CEP ${70000 + idSeed * 100}-${(idSeed % 90) + 10}`
      : `Rua das Flores, ${120 + idSeed} — ${v.cidadeUf} · CEP ${30000 + idSeed * 17}-${(idSeed % 90) + 10}`;

  return {
    tipoConta: pj ? "pessoa_juridica" : "pessoa_fisica",
    nomeFantasiaOuCompleto: v.nome,
    nomeResponsavel: pj ? `Resp. legal — ref. mock #${v.id}` : undefined,
    descricaoNegocio: pj
      ? `Revenda e intermediação de veículos na região de ${v.cidadeUf.split(" - ")[0]}. Cadastro solicitado para listar estoque no marketplace NuLances.`
      : `Vendedor autônomo de veículos. Pretende anunciar unidades próprias e de parceiros com documentação regular.`,
    enderecoCompleto: endereco,
    site: pj ? `https://loja-mock-${v.id}.exemplo.mkt` : undefined,
    inscricaoEstadual: pj ? `ISENTO / MG ${120000000 + idSeed}` : undefined,
    documentos,
    notaInterna:
      idSeed % 2 === 0
        ? "Nenhuma pendência automática detectada no mock."
        : "Verificar consistência do endereço com comprovante anexado.",
  };
}

export function buildMarketplaceVendedoresAdminSeed(): MarketplaceVendedorAdmin[] {
  const counts = aggregateAnunciosPorVendedor();
  return NOMES.map((nome, i) => {
    const agg = counts.get(nome) ?? { total: 0, publicados: 0 };
    const d = DETALHES[nome]!;
    const cadastroEm = new Date(MOCK_CADASTRO_BASE_MS + i * 86400000 * 17).toISOString();
    const status = statusForIndex(i);
    const base: MarketplaceVendedorAdmin = {
      id: i + 1,
      nome,
      email: d.email,
      telefone: d.telefone,
      cidadeUf: d.cidadeUf,
      documento: d.documento,
      status,
      cadastroEm,
      anunciosTotal: agg.total,
      anunciosPublicados: agg.publicados,
    };
    if (status === "pendente_verificacao") {
      base.perfilAnalise = buildPerfilAnaliseMock(base);
    }
    return base;
  });
}

export type VendedorFiltroStatus = "todos" | VendedorContaStatus;

export function filterVendedoresByStatus(
  list: MarketplaceVendedorAdmin[],
  filtro: VendedorFiltroStatus
): MarketplaceVendedorAdmin[] {
  if (filtro === "todos") return list;
  return list.filter((v) => v.status === filtro);
}

export function filterVendedoresBySearch(list: MarketplaceVendedorAdmin[], q: string): MarketplaceVendedorAdmin[] {
  const s = q.trim().toLowerCase();
  if (!s) return list;
  return list.filter(
    (v) =>
      v.nome.toLowerCase().includes(s) ||
      v.email.toLowerCase().includes(s) ||
      v.cidadeUf.toLowerCase().includes(s) ||
      String(v.id).includes(s) ||
      v.telefone.replace(/\D/g, "").includes(s.replace(/\D/g, ""))
  );
}
