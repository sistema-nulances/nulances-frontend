import { apiFetch } from "@/lib/api/api-fetch";
import type {
  AnuncioAdminListResponse,
  AnuncioStatusResponse,
  ListarAdminAnunciosRequest,
  SpringPage,
  SuspenderAnuncioRequest,
} from "@/lib/repositories/types/admin-anuncios.types";
import type { AnuncioResponse, EditarAnuncioRequest } from "@/lib/repositories/types/seller-anuncio.types";

export async function listarAdminAnuncios(
  params?: ListarAdminAnunciosRequest
): Promise<SpringPage<AnuncioAdminListResponse>> {
  const qs = new URLSearchParams();
  const busca = params?.busca?.trim();
  if (busca) qs.set("busca", busca);
  const vendedor = params?.vendedor?.trim();
  if (vendedor) qs.set("vendedor", vendedor);
  const status = params?.status?.trim();
  if (status) qs.set("status", status);
  qs.set("page", String(params?.page ?? 0));
  qs.set("size", String(params?.size ?? 120));

  return apiFetch<SpringPage<AnuncioAdminListResponse>>(`/admin/anuncios?${qs.toString()}`, {
    method: "GET",
  });
}

export async function buscarAdminAnuncioPorId(id: string): Promise<AnuncioResponse> {
  return apiFetch<AnuncioResponse>(`/admin/anuncios/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function editarParcialAdminAnuncio(
  id: string,
  body: EditarAnuncioRequest
): Promise<AnuncioResponse> {
  return apiFetch<AnuncioResponse>(`/admin/anuncios/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function aprovarAdminAnuncio(id: string): Promise<AnuncioStatusResponse> {
  return apiFetch<AnuncioStatusResponse>(`/admin/anuncios/${encodeURIComponent(id)}/aprovar`, {
    method: "PATCH",
  });
}

export async function suspenderAdminAnuncio(
  id: string,
  body?: SuspenderAnuncioRequest
): Promise<AnuncioStatusResponse> {
  return apiFetch<AnuncioStatusResponse>(`/admin/anuncios/${encodeURIComponent(id)}/suspender`, {
    method: "PATCH",
    body: JSON.stringify(body ?? {}),
  });
}

export async function reativarAdminAnuncio(id: string): Promise<AnuncioStatusResponse> {
  return apiFetch<AnuncioStatusResponse>(`/admin/anuncios/${encodeURIComponent(id)}/reativar`, {
    method: "PATCH",
  });
}
