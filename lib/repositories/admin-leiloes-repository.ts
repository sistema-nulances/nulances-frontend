import { apiFetch } from "@/lib/api/api-fetch";
import { ApiError } from "@/lib/repositories/types/auth.types";
import type {
  LeilaoCreateRequest,
  LeilaoItemDetalheResponse,
  LeilaoPainelResponse,
  LeilaoResponse,
} from "@/lib/repositories/types/leilao.types";

export async function listarLeiloesAdmin(): Promise<LeilaoResponse[]> {
  return apiFetch<LeilaoResponse[]>("/admin/leiloes", { method: "GET" });
}

/** Endpoint público para cards/home (sem token). */
export async function listarLeiloesPublicos(): Promise<LeilaoResponse[]> {
  const attempts: Array<() => Promise<LeilaoResponse[]>> = [
    () => apiFetch<LeilaoResponse[]>("/leiloes", { method: "GET", skipAuth: true }),
    () => apiFetch<LeilaoResponse[]>("/admin/leiloes", { method: "GET", skipAuth: true }),
  ];

  let lastError: unknown = null;
  for (const run of attempts) {
    try {
      return await run();
    } catch (err) {
      lastError = err;
      if (err instanceof ApiError && err.status !== 401 && err.status !== 403) {
        throw err;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Não foi possível carregar leilões.");
}

export async function buscarLeilaoAdminPorId(id: string): Promise<LeilaoResponse> {
  return apiFetch<LeilaoResponse>(`/admin/leiloes/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function buscarPainelLeilaoAdminPorId(id: string): Promise<LeilaoPainelResponse> {
  return apiFetch<LeilaoPainelResponse>(`/admin/leiloes/${encodeURIComponent(id)}/painel`, { method: "GET" });
}

/** Endpoint público para detalhe de item de leilão (sem token). */
export async function buscarItemLeilaoPublicoPorId(itemId: string): Promise<LeilaoItemDetalheResponse> {
  const attempts: Array<() => Promise<LeilaoItemDetalheResponse>> = [
    () => apiFetch<LeilaoItemDetalheResponse>(`/leiloes/itens/${encodeURIComponent(itemId)}`, { method: "GET", skipAuth: true }),
    () => apiFetch<LeilaoItemDetalheResponse>(`/leiloes/itens/${encodeURIComponent(itemId)}`, { method: "GET" }),
  ];

  let lastError: unknown = null;
  for (const run of attempts) {
    try {
      return await run();
    } catch (err) {
      lastError = err;
      if (err instanceof ApiError && err.status !== 401 && err.status !== 403) {
        throw err;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Não foi possível carregar item do leilão.");
}

export async function criarLeilaoAdmin(body: LeilaoCreateRequest): Promise<LeilaoResponse> {
  return apiFetch<LeilaoResponse>("/admin/leiloes", { method: "POST", body: JSON.stringify(body) });
}
