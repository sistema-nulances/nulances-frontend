import type {
  ComitenteListResponse,
  ComitenteResponse,
  TipoComitenteApi,
} from "@/lib/repositories/types/comitente.types";

export type ComitenteTipo = "Banco" | "Seguradora" | "Empresa" | "Pessoa Física";

export type ComitenteRow = {
  id: string;
  nome: string;
  tipo: ComitenteTipo;
  documento: string;
  ativo: boolean;
  totalLotes: number;
  lotesAbertos: number;
  lotesEmBreve: number;
  lotesEncerrados: number;
  localPrincipal: string;
  ultimoLote: string;
};

export type ComitenteDashboardStats = {
  totalComitentes: number;
  totalBancos: number;
  totalSeguradoras: number;
  /** Empresas e pessoas físicas cadastradas */
  totalOutros: number;
};

export function comitenteLotesFromApi(): Pick<
  ComitenteRow,
  "totalLotes" | "lotesAbertos" | "lotesEmBreve" | "lotesEncerrados" | "ultimoLote"
> {
  return {
    totalLotes: 0,
    lotesAbertos: 0,
    lotesEmBreve: 0,
    lotesEncerrados: 0,
    ultimoLote: "—",
  };
}

export function tipoComitenteApiParaUi(tipo: TipoComitenteApi): ComitenteTipo {
  if (tipo === "BANCO") return "Banco";
  if (tipo === "SEGURADORA") return "Seguradora";
  if (tipo === "PESSOA_FISICA") return "Pessoa Física";
  return "Empresa";
}

export function tipoComitenteUiParaApi(tipo: ComitenteTipo): TipoComitenteApi {
  if (tipo === "Banco") return "BANCO";
  if (tipo === "Seguradora") return "SEGURADORA";
  if (tipo === "Pessoa Física") return "PESSOA_FISICA";
  return "EMPRESA";
}

export function comitenteListResponseParaRow(r: ComitenteListResponse): ComitenteRow {
  return {
    id: r.id,
    nome: r.nome,
    tipo: tipoComitenteApiParaUi(r.tipo),
    documento: r.documento,
    ativo: String(r.status ?? "").toUpperCase() === "ATIVO",
    totalLotes: r.totalLeiloes ?? 0,
    lotesAbertos: r.totalLeiloesAoVivo ?? 0,
    lotesEmBreve: r.totalLeiloesEmBreve ?? 0,
    lotesEncerrados: r.totalLeiloesEncerrado ?? 0,
    localPrincipal: "",
    ultimoLote: "—",
  };
}

export function comitenteResponseParaRow(
  r: ComitenteResponse,
  base?: Partial<ComitenteRow>
): ComitenteRow {
  return {
    id: r.id,
    nome: r.nome,
    tipo: tipoComitenteApiParaUi(r.tipo),
    documento: r.documento,
    ativo: Boolean(r.ativoPlataforma),
    totalLotes: base?.totalLotes ?? 0,
    lotesAbertos: base?.lotesAbertos ?? 0,
    lotesEmBreve: base?.lotesEmBreve ?? 0,
    lotesEncerrados: base?.lotesEncerrados ?? 0,
    localPrincipal: r.sede ?? base?.localPrincipal ?? "",
    ultimoLote: base?.ultimoLote ?? "—",
  };
}

export function buildComitenteStats(rows: ComitenteRow[]): ComitenteDashboardStats {
  return {
    totalComitentes: rows.length,
    totalBancos: rows.filter((r) => r.tipo === "Banco").length,
    totalSeguradoras: rows.filter((r) => r.tipo === "Seguradora").length,
    totalOutros: rows.filter((r) => r.tipo === "Empresa" || r.tipo === "Pessoa Física").length,
  };
}
