import { apiFetch } from "@/lib/api/api-fetch";
import type {
  ComitenteCreateRequest,
  ComitenteDisponibilidadeResponse,
  ComitenteListResponse,
  ComitenteResponse,
  ComitenteStatsResponse,
  ComitenteUpdateRequest,
} from "@/lib/repositories/types/comitente.types";

export async function listarComitentesAdmin(): Promise<ComitenteListResponse[]> {
  return apiFetch<ComitenteListResponse[]>("/admin/comitentes", { method: "GET" });
}

export async function buscarComitenteStatsAdmin(): Promise<ComitenteStatsResponse> {
  return apiFetch<ComitenteStatsResponse>("/admin/comitentes/stats", { method: "GET" });
}

export async function buscarComitenteAdminPorId(id: string): Promise<ComitenteResponse> {
  return apiFetch<ComitenteResponse>(`/admin/comitentes/${encodeURIComponent(id)}`, { method: "GET" });
}

export async function criarComitenteAdmin(body: ComitenteCreateRequest): Promise<ComitenteResponse> {
  return apiFetch<ComitenteResponse>("/admin/comitentes", { method: "POST", body: JSON.stringify(body) });
}

export async function editarComitenteAdmin(
  id: string,
  body: ComitenteUpdateRequest
): Promise<ComitenteResponse> {
  return apiFetch<ComitenteResponse>(`/admin/comitentes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function excluirComitenteAdmin(id: string): Promise<void> {
  await apiFetch<unknown>(`/admin/comitentes/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function verificarComitenteDisponibilidadeAdmin(
  documento: string
): Promise<ComitenteDisponibilidadeResponse> {
  const d = documento.trim();
  const sp = new URLSearchParams();
  if (d) sp.set("documento", d);
  const path = d ? `/admin/comitentes/disponibilidade?${sp.toString()}` : "/admin/comitentes/disponibilidade";
  return apiFetch<ComitenteDisponibilidadeResponse>(path, { method: "GET" });
}
