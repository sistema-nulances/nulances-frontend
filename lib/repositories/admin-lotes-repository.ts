import { apiFetch } from "@/lib/api/api-fetch";
import type {
  CriarLoteRequest,
  EditarLoteRequest,
  LoteListResponse,
  LoteResponse,
  LoteStatsResponse,
} from "@/lib/repositories/types/lote.types";

export async function listarLotesAdmin(): Promise<LoteListResponse[]> {
  return apiFetch<LoteListResponse[]>("/admin/lotes", { method: "GET" });
}

export async function buscarLoteStatsAdmin(): Promise<LoteStatsResponse> {
  return apiFetch<LoteStatsResponse>("/admin/lotes/stats", { method: "GET" });
}

export async function buscarLoteAdminPorId(id: string): Promise<LoteResponse> {
  return apiFetch<LoteResponse>(`/admin/lotes/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function criarLoteAdmin(body: CriarLoteRequest): Promise<LoteResponse> {
  return apiFetch<LoteResponse>("/admin/lotes", { method: "POST", body: JSON.stringify(body) });
}

export async function editarLoteAdmin(id: string, body: EditarLoteRequest): Promise<LoteResponse> {
  return apiFetch<LoteResponse>(`/admin/lotes/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function excluirLoteAdmin(id: string): Promise<void> {
  await apiFetch<unknown>(`/admin/lotes/${encodeURIComponent(id)}`, { method: "DELETE" });
}
