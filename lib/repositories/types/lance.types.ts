import { normalizeMarcaVeiculoCode } from "@/lib/bem-marca-veiculo";

export type LanceCreateRequest = {
  leilaoLoteBemId: string;
  valor: number;
  clientRequestId: string;
};

export type LanceAtualizadoEvent = {
  leilaoLoteBemId?: string;
  itemId?: string;
  usuarioId?: string;
  valorAtual?: number | null;
  proximoLance?: number | null;
};

export type ResultadoParticipacaoUsuarioLeilao = "EM_DISPUTA" | "GANHADOR" | "NAO_GANHADOR";

export type MeuLanceParticipacaoItem = {
  leilaoLoteBemId: string;
  lanceId?: string | null;
  meuValor?: number | null;
  meuLanceEm?: string | null;
  leilaoId?: string | null;
  tituloLeilao?: string | null;
  formatoLeilao?: string | null;
  statusLeilao?: string | null;
  cidade?: string | null;
  codigoLote?: string | null;
  nomeBem?: string | null;
  /** Código enum `MarcaVeiculo` no JSON (`marcaVeiculo`) — logo e nome no /profile/lances. */
  marcaVeiculo?: string | null;
  /** Se o back enviar só `marca` em alguma versão do DTO, usamos como fallback. */
  marca?: string | null;
  modelo?: string | null;
  tipoVeiculo?: string | null;
  statusItem?: string | null;
  valorAtual?: number | null;
  aberturaDisputa?: string | null;
  encerramentoDisputa?: string | null;
  midiaCapaUrl?: string | null;
  resultadoParticipacao?: ResultadoParticipacaoUsuarioLeilao | string | null;
  quantidadeLancesMeuUsuario?: number | null;
};

export type MeusLancesListaResponse = {
  itens: MeuLanceParticipacaoItem[];
  totalElements?: number;
};

/** Código efetivo da marca a partir do item de `GET /lances/meus`. */
export function marcaVeiculoCodigoDoParticipacaoItem(item: MeuLanceParticipacaoItem): string | undefined {
  const bruto = item.marcaVeiculo ?? item.marca;
  const extraido = extrairMarcaString(bruto);
  if (!extraido) return undefined;

  const semPrefixoEnum = extraido.includes(".") ? extraido.split(".").at(-1) ?? extraido : extraido;
  const normalizado = normalizeMarcaVeiculoCode(semPrefixoEnum);
  const marcaFinal = String(normalizado || semPrefixoEnum).trim();
  return marcaFinal.length > 0 ? marcaFinal : undefined;
}

function extrairMarcaString(v: unknown): string | undefined {
  if (typeof v === "string") {
    const s = v.trim();
    return s.length > 0 ? s : undefined;
  }

  if (!v || typeof v !== "object") return undefined;
  const rec = v as Record<string, unknown>;
  const candidato =
    rec.value ??
    rec.nome ??
    rec.name ??
    rec.codigo ??
    rec.code ??
    rec.id;

  if (typeof candidato !== "string") return undefined;
  const s = candidato.trim();
  return s.length > 0 ? s : undefined;
}
