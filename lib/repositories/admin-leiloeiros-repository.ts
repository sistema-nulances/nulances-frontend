import { apiFetch } from "@/lib/api/api-fetch";
import type {
  CriarLeiloeiroRequest,
  EditarLeiloeiroRequest,
  LeiloeiroListResponse,
  LeiloeiroResponse,
  LeiloeiroStatsResponse,
} from "@/lib/repositories/types/leiloeiro.types";

export async function listarLeiloeirosAdmin(): Promise<LeiloeiroListResponse[]> {
  return apiFetch<LeiloeiroListResponse[]>("/admin/leiloeiros", { method: "GET" });
}

export async function buscarLeiloeiroStatsAdmin(): Promise<LeiloeiroStatsResponse> {
  return apiFetch<LeiloeiroStatsResponse>("/admin/leiloeiros/stats", { method: "GET" });
}

export async function buscarLeiloeiroAdminPorId(id: string): Promise<LeiloeiroResponse> {
  return apiFetch<LeiloeiroResponse>(`/admin/leiloeiros/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function criarLeiloeiroAdmin(body: CriarLeiloeiroRequest): Promise<LeiloeiroResponse> {
  return apiFetch<LeiloeiroResponse>("/admin/leiloeiros", { method: "POST", body: JSON.stringify(body) });
}

export async function editarLeiloeiroAdmin(
  id: string,
  body: EditarLeiloeiroRequest
): Promise<LeiloeiroResponse> {
  return apiFetch<LeiloeiroResponse>(`/admin/leiloeiros/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function excluirLeiloeiroAdmin(id: string): Promise<void> {
  await apiFetch<unknown>(`/admin/leiloeiros/${encodeURIComponent(id)}`, { method: "DELETE" });
}
