import { apiFetch } from "@/lib/api/api-fetch";
import type {
  LanceCreateRequest,
  MeuLanceParticipacaoItem,
  MeusLancesListaResponse,
} from "@/lib/repositories/types/lance.types";

export async function enviarLance(body: LanceCreateRequest): Promise<void> {
  await apiFetch<unknown>("/lances", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** `GET /lances/meus` — participações do usuário autenticado. */
export async function buscarMeusLances(): Promise<MeusLancesListaResponse> {
  const response = await apiFetch<MeusLancesListaResponse | Record<string, unknown>>("/lances/meus", {
    method: "GET",
  });

  const payload = isRecord(response) ? response : {};
  const itensRaw = Array.isArray(payload.itens) ? payload.itens : [];
  const itens = itensRaw.map((item) => normalizarItemParticipacao(item));

  const total =
    typeof payload.totalElements === "number" && Number.isFinite(payload.totalElements)
      ? payload.totalElements
      : itens.length;

  return { itens, totalElements: total };
}

function normalizarItemParticipacao(raw: unknown): MeuLanceParticipacaoItem {
  const item = isRecord(raw) ? raw : {};
  const marcaBruta =
    item.marcaVeiculo ?? item.marca_veiculo ?? item.marca ?? item.marcaBem ?? item.marca_bem ?? null;

  const modelo = textoOuNulo(item.modelo);
  const nomeBem = textoOuNulo(item.nomeBem ?? item.nome_bem);

  return {
    ...item,
    marcaVeiculo: extrairMarcaCodigo(marcaBruta),
    marca: extrairMarcaCodigo(item.marca),
    modelo: modelo ?? nomeBem,
    nomeBem,
  } as MeuLanceParticipacaoItem;
}

function extrairMarcaCodigo(value: unknown): string | null {
  if (typeof value === "string") {
    const marca = value.trim();
    return marca.length > 0 ? marca : null;
  }

  if (isRecord(value)) {
    const nested =
      textoOuNulo(value.value) ??
      textoOuNulo(value.nome) ??
      textoOuNulo(value.name) ??
      textoOuNulo(value.code) ??
      textoOuNulo(value.codigo);
    return nested ?? null;
  }

  return null;
}

function textoOuNulo(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
